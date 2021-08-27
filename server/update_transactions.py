from web3 import Web3
from eth_utils import decode_hex
import json

from config import chain_http_url, compiled_contract, contract_address_file

w3 = Web3(Web3.HTTPProvider(chain_http_url))

f = open(contract_address_file)
contract_address = f.readline().strip()
f.close()

f = open(compiled_contract)
contract_json = json.load(f)
abi = contract_json['abi']
f.close()

contract = w3.eth.contract(address=contract_address, abi=abi)
transaction = contract.events.Transfer()

contract_bytes = decode_hex(contract_address)

def update_db(current_block, collection):
    bn = w3.eth.block_number
    if bn == current_block:
        return bn
    event_filter = transaction.createFilter(
        fromBlock = current_block + 1,
        toBlock = bn
    )
    for txn in event_filter.get_all_entries():
        receipt = w3.eth.waitForTransactionReceipt(txn['transactionHash'])
        result = transaction.processReceipt(receipt)[0]['args']
        if result['value'] >= 1e10 and result['from'][2:] != "0" * 40:
            payer = result['from'].lower()
            receiver = result['to'].lower()
            print(payer, receiver)
            check = collection.find_one({
                'payer': payer,
                'receiver': receiver
            })
            if check is None:
                collection.insert_one({
                    'payer': payer,
                    'receiver':receiver
                })
    return bn

def update_db_paylist(current_block, paylist):
    bn = w3.eth.block_number
    if bn == current_block:
        return bn
    event_filter = transaction.createFilter(
        fromBlock = current_block + 1,
        toBlock = bn
    )
    for txn in event_filter.get_all_entries():
        receipt = w3.eth.waitForTransactionReceipt(txn['transactionHash'])
        result = transaction.processReceipt(receipt)[0]['args']
        if result['value'] >= 1e10 and result['from'][2:] != "0" * 40:
            payer = result['from'].lower()
            receiver = result['to'].lower()
            found = False
            for x in paylist:
                if x['payer'] == payer and x['receiver'] == receiver:
                    found = True
            if not found:
                paylist.append({
                    'payer': payer,
                    'receiver':receiver
                })
    return bn
