import hashlib

from pymongo import *

def init_multiple(names, db):
    mapper = {
        'all_users': init_users,
        'content': init_content,
        'payment': init_payment
    }
    for name in names:
        mapper[name](db[name])

def init_users(db_users):
    # !*address, last_login, num_content
    db_users.create_index([('address', ASCENDING)], unique=True)

def init_users(db_content):
    # _id, *creator, *counter
    db_content.create_index([
        ('creator', ASCENDING),
        ('counter', ASCENDING)
    ], unique=False)

def init_payment(db_payment):
    # _id, *payer, *receiver
    db_content.create_index([
        ('payer', ASCENDING),
        ('receiver', ASCENDING)
    ], unique=False)

