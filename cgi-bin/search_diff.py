#!/usr/bin/python

import cgi, cgitb
import json
import MySQLdb

cgitb.enable()

f=open('debug.log', 'w')

#===== DB configuration ======
db_addr = "db address"
db_id = "db id"
db_pw = "db password"
db_name = "db name"

def connect_to_db():
    return MySQLdb.connect(host=db_addr, user=db_id, passwd=db_pw, db=db_name, charset='utf8', port=3306)

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

def get_table_name(city, model):
    return model + "_" + city;

def make_sql(table, target="*", cond=None):
    sql = "select " + target + " from " + table
    if cond != None:
        sql += " where "
        
        for i in range(len(cond)-1):
            sql += cond[i] + " and "
            
        sql += cond[-1]
        
    return sql    

def get_building_location(rows):
    properties = []
    log_table = {}
    
    for i in range(len(rows)):
        addr = rows[i][0] + ' ' + rows[i][1]
        
        if rows[i][2] != 'NULL':
            addr += ' '
            addr += rows[i][2]
            
        lng = rows[i][3]
        lat = rows[i][4]
        rank = rows[i][5] - rows[i][6]
        
        if addr not in log_table:
            log_table[addr] = {"lat":lat, "lng":lng, "ranks":[float(rank)]}
        else:
            log_table[addr]["ranks"].append(rank)
    
    for key, value in log_table.iteritems():
        avg = reduce(lambda x, y: x + y, value["ranks"]) / len(value["ranks"])
        properties.append({"lat":value["lat"], "lng":value["lng"], "addr":key, "rank":avg})
        
    return properties

def get_complex_location(rows):
    properties = []
    log_table = {}
    
    for i in range(len(rows)):
        addr = rows[i][0] + ' ' + rows[i][1]
            
        lng = rows[i][3]
        lat = rows[i][4]
        rank = rows[i][5] - rows[i][6]
        
        if addr not in log_table:
            log_table[addr] = {"lat":lat, "lng":lng, "ranks":[float(rank)]}
        else:
            log_table[addr]["ranks"].append(rank)
    
    for key, value in log_table.iteritems():
        avg = reduce(lambda x, y: x + y, value["ranks"]) / len(value["ranks"])
        properties.append({"lat":value["lat"], "lng":value["lng"], "addr":key, "rank":avg})
        
    return properties

def get_ranked_properties(city, model, display, features):
    conn = connect_to_db()
    curs = conn.cursor()
    
    target = "a1, a2, a3, Longitude, latitude, realrank, testrank"
    cond = get_cond_from_features(features)
    table = get_table_name(city, model)
    
    sql = make_sql(table=table, target=target, cond=cond)
    
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
    model = args["model"]
    display = args["display"]
    features = args["features"]
    
    city_loc = get_city_location(city=city)
    properties = get_ranked_properties(city=city, model=model, display=display, features=features)
    
    response = {"city_loc":city_loc, "properties":properties}

    print "Content-Type: json\n"
    print json.dumps(response)

handle_request()
f.close()
