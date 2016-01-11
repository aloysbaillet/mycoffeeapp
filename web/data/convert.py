import json
import string

logs = json.load(open('./coffeeTrainLog.json'))
users = json.load(open('./coffeeTrainUsers.json'))

for user in users:
    for log in logs:
        if log['message'].startswith(user['name']):
            log['payerId'] = user['firebaseId']
            log['message2'] = string.replace(log['message'], user['name'], str(user['firebaseId']), 1)

i = 0
for user in users:
    for log in logs:
        clients = log.get('orderList', {})
        if user['name'] in log['message2']:
            clients[i] = user['firebaseId']
            i += 1
            log['message2'] = log['message2'].replace(user['name'], str(user['firebaseId']))
        log['orderList'] = clients

for log in logs:
    del log['message2']
    del log['purchaserid']
    log['cost'] = log['numpurchased']
    log['timestamp'] = log['date']
    del log['date']
    if log['numpurchased'] != len(log['orderList']):
        raise RuntimeError('BAD NUMBER OF CLIENTS! %s'%log)
    del log['numpurchased']

json.dump(logs, open('./coffeeTrainLogProcessed.json', 'w'))
