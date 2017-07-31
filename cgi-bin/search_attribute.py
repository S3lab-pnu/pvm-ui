#!/usr/bin/python

import cgi, cgitb
import json
import MySQLdb
import time

cgitb.enable()

f=open('debug.log', 'w')

bad_features = ["p18", "p27", "l1", "l2", "l3", "l5", "n1", "n2", "n3", "n4", "n8"]

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

def get_target_from_features(features,s_index=0):
    target = ""
    index_table = {}

    for i in range(len(features)):
        if features[i]["name"] != 'p1':
            target += ", " + features[i]["name"]
            index_table[features[i]["name"]] = s_index + i
            
    return target, index_table

def get_cond_from_features(features):
    cond = []
    
    for i in range(len(features)):
        if features[i]["weight"] != -1:
            cond.append(features[i]["name"] + " >= " + str(features[i]["value"][0]))
            cond.append(features[i]["name"] + " <= " + str(features[i]["value"][1]))
    
    return cond

def normalize(rows):
    normalized_rows = []
    min_max = {}
    
    for row in rows:
        for i in range(6, len(row)):
            if i not in min_max:
                min_max[i] = {"min":row[i], "max":row[i]}
            else:
                if min_max[i]["min"] > row[i]:
                    min_max[i]["min"] = row[i]
                elif min_max[i]["max"] < row[i]:
                    min_max[i]["max"] = row[i]
    q = 0
    for row in rows:
        new_row = []
        q+=1
        
        for j in range(6):
            new_row.append(row[j])
            
        for j in range(6, len(row)):
            if min_max[j]["max"] == min_max[j]["min"]:
                normalized_value = 1
            else:
                normalized_value = float(row[j]-min_max[j]["min"])/float(min_max[j]["max"]-min_max[j]["min"])
            
            new_row.append(normalized_value)
            
        normalized_rows.append(new_row)
        
    return normalized_rows

def calc_weight(row, features, target_index_table):
    weight = 0.0
   
    for feature in features:
        if (feature["weight"] is not -1) and (feature["weight"] is not 101):

            if feature["name"] in bad_features:
                weight += (1-row[target_index_table[feature["name"]]]) * float(feature["weight"]) / 100.0
            else:
                weight += row[target_index_table[feature["name"]]] * float(feature["weight"]) / 100.0
    
    return weight

def get_complex_location(rows, features, target_index_table):
    complex_locs = []
    log_table = {}
    
    normalized_rows = []
    normalized_rows = normalize(rows)

    for i in range(len(rows)):
        lat = rows[i][1]
        lng = rows[i][0]
        addr = rows[i][2] + " " + rows[i][3] + " " + rows[i][4]
        weight = calc_weight(normalized_rows[i], features, target_index_table)

        if addr not in log_table:
            log_table[addr] = {"lat":lat, "lng":lng, "weights":[weight]}
        else:
            log_table[addr]["weights"].append(weight)
        
        
    for key, value in log_table.iteritems():
        avg = reduce(lambda x, y: x + y, value["weights"]) / len(value["weights"])
        complex_locs.append({"lat":value["lat"], "lng":value["lng"], "value":avg, "addr": key})
        
    return complex_locs

def get_building_location(rows, features, target_index_table):
    loc_buildings = []
    
    log_table = {}
    addr_index = 0;
    
    normalized_rows = []
    normalized_rows = normalize(rows)
    
    for i in range(len(rows)):
        lat = rows[i][1]
        lng = rows[i][0]
        addr = rows[i][2] + " " + rows[i][3] + " " + rows[i][4]
        
        if rows[i][5] != "NULL":
            addr += " "
            addr += rows[i][5]
        
        if addr not in log_table:
            log_table[addr] = 1
            weight = calc_weight(normalized_rows[i], features, target_index_table)
                
            loc_buildings.append({"lat":lat, "lng":lng, "addr":addr, "value":weight})
    
    return loc_buildings


def get_matched_properties(city, features, display):
    conn = connect_to_db()
    curs = conn.cursor()
    target = "p28, p29, p4, p5, p6, p7"
    target_index_table = {}
    locations = []
    
    extra_target, target_index_table = get_target_from_features(s_index=6, features=features)
        
    target += extra_target
        
    cond = get_cond_from_features(features=features)
    
    sql = make_sql(target=target, table=city, cond=cond)

    curs.execute(sql)
    rows = []
    rows = curs.fetchall()
    conn.close()
    
    if display == "complex":
        locations = get_complex_location(rows, features, target_index_table)
    else:
        locations = get_building_location(rows, features, target_index_table)
    
    return locations
    

def handle_request():
    form = cgi.FieldStorage()
    request_data = form.getvalue("args")
    
    args = json.loads(request_data)
    
    city = args["city"]
    features = args["features"]
    display = args["display"]
    
    city_loc = get_city_location(city=city)
    f.write("city_loc done\n")
    properties = get_matched_properties(city=city, features=features, display=display)
    f.write("pro done\n")
    response = {"city_loc":city_loc, "properties":properties, "display":display}

    print "Content-Type: application/json\n"
    print json.dumps(response)


handle_request()
f.close()
