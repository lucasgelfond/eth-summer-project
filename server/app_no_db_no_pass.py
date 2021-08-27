from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from flask_restful.utils import cors
from time import time

import json

from eth_utils import keccak, decode_hex
from eth_keys import KeyAPI
from eth_keys.datatypes import PublicKey, Signature

from update_transactions import update_db_paylist 
from config import secret

app = Flask(__name__)
api = Api(app)
CORS(app, origins="*", allow_headers=["Content-Type", "Access-Control-Allow-Credentials"])

seed = str(keccak(secret.encode())) # CHANGE THIS IN PRODUCTION

signature_key = KeyAPI('eth_keys.backends.NativeECCBackend')

all_users = []
content = []
paylist = []

current_block = -1

header_parser = reqparse.RequestParser()
header_parser.add_argument('address', required=True)

def find_one(content_list, quality_dict):
    for item in content_list:
        found = True
        for key in quality_dict.keys():
            if item.get(key, None) != quality_dict[key]:
                found = False
        if found:
            return item
    return None

def recover_address(message, signature):
    modified_message = '\u0019Ethereum Signed Message:\n' + str(len(message)) + message
    sig_bytes = decode_hex(signature)
    sig_bytes = sig_bytes[:-1] + (sig_bytes[-1] - 27).to_bytes(1, 'big')
    sig_object = Signature(sig_bytes)
    addr = PublicKey.recover_from_msg(modified_message.encode(), sig_object).to_address()
    return str(addr)

def verify_token(token):
    timestamp = int(token[:8], 16)
    address = "0x" + token[8:48]
    signature = "0x" + token[48:178]
    server_token = token[178:]
    if recover_address("logging_in_at_time_" + str(timestamp), signature) != address:
        return None
    if str(keccak((signature + seed).encode()).hex()) != server_token:
        return None 
    return address 

login_parser = reqparse.RequestParser()
login_parser.add_argument('login_time')
login_parser.add_argument('address')
login_parser.add_argument('signature')

class Login(Resource):
    @cors.crossdomain(origin='*')
    def get(self):
        args = login_parser.parse_args()
        address = args['address'].lower()
        epoch_time = int(time())
        return {'server_time': epoch_time}
    def post(self):
        args = login_parser.parse_args()
        try:
            login_time = args['login_time']
            if int(login_time) + 60 < int(time()):
                #took over a minute to log in
                return "Login expired", 401
            address = args['address'].lower()
            signature = args['signature'].lower()
            message = "logging_in_at_time_" + str(login_time)
            rec_addr = recover_address(message, signature)
            if rec_addr == address:
                user = find_one(all_users, {'address': address})
                if user is None:
                    all_users.append({'address': address, 'num_content': 0})
                return {'token': str(keccak((signature + seed).encode()).hex())}, 200
            return "Invalid signature", 401
        except Exception as e:
            return "Invalid request", 400

bio_parser = header_parser.copy()
bio_parser.add_argument('bio', required=True)

class Bio(Resource):
    @cors.crossdomain(origin='*')
    def post(self):
        try:
            args = bio_parser.parse_args()
            address = args['address'].lower()
            bio = args['bio']
            try:
                user = find_one(all_users, {'address': address})
                if user is None:
                    all_users.append({'address': address, 'num_content': 0})
                    user = find_one(all_users, {'address': address})
                user["bio"] = bio 
                return "Received bio", 200
            except Exception as e:
                print(e)
                return "User not found", 401
        except Exception as e:
            print(e)
            return "Invalid request", 400

create_parser = header_parser.copy()
create_parser.add_argument('title', required=True)
create_parser.add_argument('lyrics', required=True)

class Create(Resource):
    @cors.crossdomain(origin='*')
    def post(self):
        try:
            args = create_parser.parse_args()
            address = args['address'].lower()
            title = args['title']
            lyrics = args['lyrics']
            try:
                user = find_one(all_users, {'address': address})
                if user is None:
                    all_users.append({'address': address, 'num_content': 0})
                    user = find_one(all_users, {'address': address})
                user['num_content'] += 1
                content.append({
                    'creator': address,
                    'counter': user['num_content'],
                    'title': title,
                    'lyrics': lyrics
                })
                return "Song received", 200
            except:
                return "User not found", 401
        except:
            return "Invalid request", 400

artist_get_parser = reqparse.RequestParser()
artist_get_parser.add_argument('address', required=True)

artist_post_parser = header_parser.copy()
artist_post_parser.add_argument('artist_address', required=True)

def get_song_list(address):
    user = find_one(all_users, {'address': address})
    if user is None:
        return []
    n_songs = user.get('num_content', 0)
    songs = []
    for i in range(1, n_songs + 1):
        song = find_one(content, {
            'creator': address,
            'counter': i
        })
        songs.append({'song_number': i, 'title': song['title']})
    return json.dumps({'songs': songs})

def has_access(address, artist_address):
    global current_block
    current_block = update_db_paylist(current_block, paylist)
    if address == artist_address:
        return True
    payment = find_one(paylist, {
        'payer': address,
        'receiver': artist_address
    })
    if payment is None:
        return False
    return True

class Artist(Resource):
    @cors.crossdomain(origin='*')
    def get(self):
        args = artist_get_parser.parse_args()
        artist_address = args['address'].lower()
        user = find_one(all_users, {'address': artist_address})
        if user is None:
            return {"bio": "No Bio Available", "songs": json.dumps({"songs": []})}, 200
        bio = user.get("bio", "No Bio Available")
        songs = get_song_list(artist_address)
        return {"bio": bio, "songs": songs}, 200
    def post(self):
        try:
            args = artist_post_parser.parse_args()
            address = args['address'].lower()
            artist_address = args['artist_address'].lower()
            if not has_access(address, artist_address):
                return {"msg": "No access"}, 200
            return {"msg": "Yes access"}, 200
        except Exception as e:
            print(e)
            return "Invalid request", 400

song_parser = header_parser.copy()
song_parser.add_argument('artist_address', required=True)
song_parser.add_argument('song_number', required=True)

class Song(Resource):
    def post(self):
        try:
            args = song_parser.parse_args()
            address = args['address'].lower()
            artist_address = args['artist_address'].lower()
            song_number = args['song_number']
            if not has_access(address, artist_address):
                return "Need to purchase access", 401
            song = find_one(content, {
                'creator': artist_address,
                'counter': int(song_number)
            })
            if song is None:
                return "Song not found", 204
            return {"title": song['title'], "lyrics": song['lyrics']}, 200
        except Exception as e:
            print(e)
            return "Invalid request", 400

api.add_resource(Login, "/api/login")
api.add_resource(Bio, "/api/bio")
api.add_resource(Create, "/api/create")
api.add_resource(Artist, "/api/artist")
api.add_resource(Song, "/api/song")

if __name__ == '__main__':
    app.run(port=8080, debug=True)
