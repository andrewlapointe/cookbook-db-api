import pytest
import requests
import json

PATH_PREFIX = 'http://localhost:3000/api'

def test_users():
    headers = {"Content-Type": "application/json"}
    user_data = { "username" : "unitTestUser",
                "email" : "unitTestEmail@fakemail.com",
                "password_hash" : "fakepasswordhash"}
    
    create_response = requests.post(
        PATH_PREFIX + "/user/new", 
        data=json.dumps(user_data),
        headers=headers)    
    
    assert create_response.status_code == 200
    
    id = create_response.json()['user_id']
    str_id = str(id)    

    read_response = requests.get(f"{PATH_PREFIX}/user/{id}")

    assert read_response.status_code == 200
    assert read_response.json()[0]['username'] == user_data['username']
    assert read_response.json()[0]['email'] == user_data['email']

    updated_user_data = { "username" : "newUnitTestUser",
                "email" : "unitTestEmail@fakemail.com",
                "id" : str_id}
    
    update_response = requests.put(
        f"{PATH_PREFIX}/user/edit",
        data=json.dumps(updated_user_data),
        headers=headers)
    
    assert update_response.status_code == 200
    assert update_response.json()[0]['username'] == updated_user_data['username']
    
    delete_response = requests.delete(
        f"{PATH_PREFIX}/user/delete", 
        data=json.dumps({ "id" : str(id)}),
        headers=headers)
    
    assert delete_response.status_code == 200


# def test_recipes():
#     response = requests.get(f"{PATH_PREFIX}/")
#     response = requests.post(f"{PATH_PREFIX}/")
#     response = requests.delete(f"{PATH_PREFIX}/")
#     response = requests.put(f"{PATH_PREFIX}/")

# def test_notes():
#     response = requests.get(f"{PATH_PREFIX}/")
#     response = requests.post(f"{PATH_PREFIX}/")
#     response = requests.delete(f"{PATH_PREFIX}/")
#     response = requests.put(f"{PATH_PREFIX}/")

# def test_favorites():
#     response = requests.get(f"{PATH_PREFIX}/")
#     response = requests.post(f"{PATH_PREFIX}/")
#     response = requests.delete(f"{PATH_PREFIX}/")