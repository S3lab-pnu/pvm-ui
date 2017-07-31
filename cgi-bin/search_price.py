#!/usr/bin/python

import cgi, cgitb
import json
import MySQLdb
import time

cgitb.enable()

f=open('debug.log', 'w')

#===== DB configuration ======
db_addr = "db address"
db_id = "db id"
db_pw = "db password"
db_name = "db name"

def connect_to_db():
    return MySQLdb.connect(host=db_addr, user=db_id, passwd=db_pw, db=db_name, charset='utf8', port=3306)

def make_sql(table, target="*", cond=None):
    sql = "select " + target + " from " + table
    
    if cond != None:
        sql += " where "
        
        for i in range(len(cond)-1):
            sql += cond[i] + " and "
            
        sql += cond[-1]
        
    return sql

def get_city_location(city):
    conn = connect_to_db()
    curs = conn.cursor()
    
    cond=[]
    cond.append("city_name = '" + city + "'")
    sql = make_sql(table="city_info", cond=cond)
    
    curs.execute(sql)
    
    rows = curs.fetchall()
    
    lat = rows[0][1]
    lng = rows[0][2]
    zoom = int(rows[0][3])
    
    city_loc = {"lat":lat, "lng":lng, "zoom":zoom}
    
    return city_loc

def get_cond_from_features(features):
    cond = []
    
    for i in range(len(features)):
        cond.append(features[i]["name"] + " " + features[i]["oper"] + " " + str(features[i]["value"]))
    
    return cond

def get_complex_location(rows):
    complex_locs = []
    log_table = {}
    
    for i in range(len(rows)):
        lat = rows[i][1]
        lng = rows[i][0]
        addr = rows[i][2] + " " + rows[i][3] + " " + rows[i][4]
        price = rows[i][6]
        
        if addr not in log_table:
            log_table[addr] = {"lat":lat, "lng":lng, "prices":[price]}
        else:
            log_table[addr]["prices"].append(price)
            
    for key, value in log_table.iteritems():
        avg = reduce(lambda x, y: x + y, value["prices"]) / len(value["prices"])
        complex_locs.append({"lat":value["lat"], "lng":value["lng"], "price":avg, "addr": key})
        
    return complex_locs

def get_building_location(rows):
    loc_buildings = []
    log_table = {}
    addr_index = 0;
    
    for i in range(len(rows)):
        lat = rows[i][1]
        lng = rows[i][0]
        addr = rows[i][2] + " " + rows[i][3] + " " + rows[i][4]
        
        if rows[i][5] != "NULL":
            addr += " "
            addr += rows[i][5]

        price = rows[i][6]
        if addr not in log_table:
            log_table[addr] = {"lat":lat, "lng":lng, "prices":[price]}
        else:
            log_table[addr]["prices"].append(price)
            
    for key, value in log_table.iteritems():
        avg = reduce(lambda x, y: x + y, value["prices"]) / len(value["prices"])
        loc_buildings.append({"lat":value["lat"], "lng":value["lng"], "price":avg, "addr": key})
        
    return loc_buildings

def get_matched_properties(city, features, display):
    conn = connect_to_db()
    curs = conn.cursor()
    target = "p28, p29, p4, p5, p6, p7, p2"
    target_index_table = {}
        
    cond = get_cond_from_features(features=features)
    
    sql = make_sql(target=target, table=city, cond=cond)

    curs.execute(sql)
    
    rows = []
    rows = curs.fetchall()
    conn.close()
    
    locations = []
    
    if display == "complex":
        locations = get_complex_location(rows)
    else:
        locations = get_building_location(rows)
        
    return locations

def handle_request():
    form = cgi.FieldStorage()
    request_data = form.getvalue("args")
    
    args = json.loads(request_data)
    
    city = args["city"]
    features = args["features"]
    display = args["display"]
    
    city_loc = get_city_location(city=city)
    properties = get_matched_properties(city=city, features=features, display=display)
    
    response = {"city_loc":city_loc, "properties":properties, "display":display}

    print "Content-Type: json\n"
    print json.dumps(response)

handle_request()
f.close()
