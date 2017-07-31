// ****** search condition check ******
function is_select_menu_selected(id) {
    'use strict';
    var s_element;
    
    s_element = document.getElementById(id);
    
    if (s_element.value === 'hide') {
        return false;
    }
    
    return true;
}

function is_city_selected() {
    return is_select_menu_selected('city_select');
}

function is_model_selected() {
    return is_select_menu_selected('analysis_model');
}

function search_cond_check() {
    if (!is_city_selected()) {
        alert('대상 지역이 선택되지 않았습니다. \n지역을 선택해 주세요.');
        return false;
    }
    
    if (!is_model_selected()) {
        alert('학습 모델이 선택되지 앟았습니다. \n모델을 선택해 주세요.');
        return false;
    }
    
    return true;
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

// ****** search method check ******
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

///////////
function get_selected_city() {
    'use strict';
    return document.getElementById('city_select').value;
}

function get_selected_model() {
    return document.getElementById('analysis_model').value;
}

// search for value visualization
function search_value_info() {
    'use strict';
    var city, min, min_v, max, max_v, features, model, display, data, request_data, request;
    
    features = [];
    
    city = get_selected_city();
    model = get_selected_model();
    display = get_display_method();
    
    min_v = (document.getElementById("p1_min").value);
    max_v = (document.getElementById("p1_max").value);
    
    min = {name : "p1", value : min_v, oper : '>='};
    max = {name : "p1", value : max_v, oper : '<='};
    
    features.push(min);
    features.push(max);
    
    data = { city : city, model : model, display : display, features : features };
    request_data = {args : JSON.stringify(data)};
    
    request = $.ajax({
        type: "POST",
        data: request_data,
        dataType: "json",
        url: "../../cgi-bin/search_value.py",
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
            draw_map(response.city_loc, response.properties, 'show_value');
        },
        error: function () {
            alert("DB not connected.");
        }
    });
}

// search for diff visualization
function search_diff_info() {
    'use strict';
    var city, model, display, min, min_v, max, max_v, features, data, request_data, request;
    
    features = [];
    
    city = get_selected_city();
    model = get_selected_model();
    display = get_display_method();
    
    min_v = (document.getElementById("p1_min").value);
    max_v = (document.getElementById("p1_max").value);
    
    min = {name : "p1", value : min_v, oper : '>='};
    max = {name : "p1", value : max_v, oper : '<='};
    
    features.push(min);
    features.push(max);
    
    data = { city : city, model : model, display : display, features : features  };
    request_data = {args : JSON.stringify(data)};
    
    request = $.ajax({
        type: "POST",
        data: request_data,
        dataType: "json",
        url: "../../cgi-bin/search_diff.py",
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
            draw_map(response.city_loc, response.properties, 'show_diff');
        },
        error: function () {
            alert("DB not connected.");
        }
    });
}

// search_usting
function click_search() {
    'use strict';
    var search_method, i;
    
    if (!search_cond_check()) {
        return;
    }
    
    search_method = get_search_method();
    
    if (search_method === 'show_value') {
        search_value_info();
    } else {
        search_diff_info();
    }
    
    update_summary(search_method);
}