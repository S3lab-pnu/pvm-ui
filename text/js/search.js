/*jslint devel: true */

function get_search_method() {
    'use strict';
    var search_method, method_elements, i;
    
    search_method = "";
    method_elements = document.getElementsByClassName('search_method');
    
    for (i = 0; i < method_elements.length; i += 1) {
        if (method_elements[i].classList.length === 2) {
            search_method = method_elements[i].value;
            break;
        }
    }
    
    return search_method;
}

function get_display_method() {
    'use strict';
    var display_method, method_elements, i;
    
    display_method = "";
    method_elements = document.getElementsByClassName('display_method');
    
    for (i = 0; i < method_elements.length; i += 1) {
        if (method_elements[i].classList.length === 2) {
            display_method = method_elements[i].value;
            break;
        }
    }
    
    return display_method;
}

function check_weight_sum() {
    'use strict';
    var sum, w_id, w_element, key, i;
    
    sum = 0;
    
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            for (i = 0; i < attributes[key].length; i += 1) {
                w_id = 'w_' + attributes[key][i].attr_symbol;
                w_element = document.getElementById(w_id);
                
                if (!w_element.disabled) {
                    sum += parseInt(w_element.value, 10);
                }
            }
        }
    }
    
    if (sum === 100) {
        return true;
    }
    
    return false;
}

function is_city_selected() {
    'use strict';
    var s_element;
    
    s_element = document.getElementById('city_select');
    
    if (s_element.value === 'hide') {
        return false;
    }
    
    return true;
}

function is_attr_checked() {
    'use strict';
    var check_id, check_element, key, i;
    
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            if (key !== 'area') {
                for (i = 0; i < attributes[key].length; i += 1) {
                    check_id = attributes[key][i].attr_symbol + '_check';
                    check_element = document.getElementById(check_id);

                    if (check_element.checked) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

function get_selected_city() {
    'use strict';
    return document.getElementById('city_select').value;
}

function search_using_price_info() {
    'use strict';
    var city, min, min_v, max, max_v, features, display, data, request_data, request;
    
    if (!is_city_selected()) {
        alert('지역이 선택되지 않았습니다. \n지역을 선택해 주세요.');
        return;
    }
    
    features = [];
    
    update_summary('p2_only');
    
    city = get_selected_city();
    display = get_display_method();
    
    min_v = (document.getElementById("p2_min").value);
    max_v = (document.getElementById("p2_max").value);
    
    min = {name : "p2", value : min_v, oper : '>='};
    max = {name : "p2", value : max_v, oper : '<='};
    
    features.push(min);
    features.push(max);
    
    min_v = (document.getElementById("p1_min").value);
    max_v = (document.getElementById("p1_max").value);
    
    min = {name : "p1", value : min_v, oper : '>='};
    max = {name : "p1", value : max_v, oper : '<='};
    
    features.push(min);
    features.push(max);
    
    data = { city : city, features : features, display : display };
    request_data = {args : JSON.stringify(data)};
    
    request = $.ajax({
        type: "POST",
        data: request_data,
        dataType: "json",
        url: "../../cgi-bin/search_price.py",
        cache: false,
        beforeSend: function () {
            $('html').css('cursor', 'wait');
            $('.wrap-loading').removeClass('display-none');
        },
        complete: function () {
            $('html').css('cursor', 'auto');
            $('.wrap-loading').addClass('display-none');
        },
        success: function (response) {
            draw_map(response.city_loc, response.properties, true, response.display);
        },
        error: function () {
            alert("DB not connected.");
        }
    });
}

function get_weighted_features() {
    var features, feature, f_name, w_name, min, max, weight, i;
    
    features = [];
    
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            for (i = 0; i < attributes[key].length; i += 1) {
                f_name = attributes[key][i].attr_symbol;
                w_name = 'w_' + f_name;
                
                min = document.getElementById(f_name + '_min').value;
                max = document.getElementById(f_name + '_max').value;
                weight = document.getElementById(w_name);
                
                if (!weight.disabled) {
                    feature = { name : f_name, value : [min, max], weight : weight.value };
                } else {
                    if (f_name === 'p1') {
                        feature = { name : f_name, value : [min, max], weight : 101 };
                    } else {
                        feature = { name : f_name, value : [min, max], weight : -1 };
                    }
                }
                
                features.push(feature);
            }
        }
    }
    return features;
}

function search_using_attribute_info() {
    'use strict';
    var city, features, display, data, request_data, request;
    
    if (!is_city_selected()) {
        alert('지역이 선택되지 않았습니다. \n지역을 선택해 주세요.');
        return;
    }
    
    if (!is_attr_checked()) {
        alert('어떤 속성도 선택되지 않았습니다. \n속성을 선택해 주세요.');
        return;
    }
    
    if (!check_weight_sum()) {
        alert('가중치의 합이 100이 아닙니다. \n가중치 값을 확인해 주세요.');
        return;
    }
    
    update_summary('attr_');
    
    city = get_selected_city();
    features = get_weighted_features();
    display = get_display_method();
    
    data = { city : city, features : features, display : display};
    request_data = {args : JSON.stringify(data)};
    
    request = $.ajax({
        type: "POST",
        data: request_data,
        dataType: "json",
        url: "../../cgi-bin/search_attribute.py",
        cache: false,
        beforeSend: function () {
            $('html').css('cursor', 'wait');
            $('.wrap-loading').removeClass('display-none');
        },
        complete: function () {
            $('html').css('cursor', 'auto');
            $('.wrap-loading').addClass('display-none');
        },
        success: function (response) {
            draw_map(response.city_loc, response.properties, false, response.display);
        },
        error: function () {
            alert("DB not connected.");
        }
    });
}

function click_search() {
    'use strict';
    var search_method, i;
    
    search_method = get_search_method();
    
    if (search_method === 'p2_only') {
        search_using_price_info();
    } else {
        search_using_attribute_info();
    }
    
    
}
