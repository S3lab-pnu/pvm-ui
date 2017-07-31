/*jslint devel: true */

var cities = [
    {suwon : "수원"},
    {gunpo : "군포"},
    {anyang : "안양"}
];

var attr_classes = {
    area : "면적"
}

var attr_list = {
    area : [
        {attr_name : "면적", attr_symbol : "p1", attr_min : 0, attr_max : 250, attr_step : 1, attr_unit : "㎡"}
    ]
}

function change_display(e) {
    'use strict';
    var i, value, method_elements;
    
    if (e.classList.length !== 2) {
        value = e.value;
        method_elements = document.getElementsByClassName('display_method');
        
        for (i = 0; i < method_elements.length; i += 1) {
            method_elements[i].classList.toggle('active');
        }
    }
}

function set_select_menu(menu_name, menu_id, options) {
    'use strict';
    var select_element, html, i, key;
    
    select_element = document.getElementById(menu_id);
    html = "";
    
    html += "<option value='hide'>-------- " + menu_name + " --------</option>\n";
    
    for (i = 0; i < options.length; i += 1) {
        key = Object.keys(options[i])[0];
        html += "<option value='" + key + "'> " + options[i][key] + " </option>\n";
    }
    
    select_element.innerHTML = html;
}

function show_value_menu() {
    'use strict';
    var menu_name, menu_id, options, i;
    
    menu_name = "학습 모델";
    menu_id = "analysis_model";
    options = [];
    
    for (i = 0; i < cities.length; i += 1) {
        options.push(cities[i]);
    }
    
    options.push({real : "실제 가치"});
    
    set_select_menu(menu_name, menu_id, options);
}

function show_diff_menu() {
    'use strict';
    var menu_name, menu_id;
    
    menu_name = "학습 모델";
    menu_id = "analysis_model";
    
    set_select_menu(menu_name, menu_id, cities);
}

function get_city_name_kr(city) {
    'use strict';
    var i, key;
    
    for (i = 0; i < cities.length; i += 1) {
        key = Object.keys(cities[i])[0];
        if (key === city){ break; }
    }
    
    return cities[i][city];
}

function update_summary(search_method) {
    'use strict';
    var summary, html, city, min, max, model, i;
    
    html = "";
    summary = document.getElementById('summary_div');
    city = document.getElementById('city_select').value;
    model = document.getElementById('analysis_model').value;
    
    
    
    html += "<p class='attr_class'> 검색 조건 </p>";
    if (search_method === 'show_value') {
        html += "<p class='sum_sub_t'>• 시각화 방법: <a class='attr_value'>가치 값</a></p>"
    } else {
        html += "<p class='sum_sub_t'>• 시각화 방법: <a class='attr_value'>가치 차이</a></p>"
    }
    
    html += "<p class='sum_sub_t'>• 대상 지역: <a class='attr_value'>"+ get_city_name_kr(city) + "</a></p>"
    
    if (model !== 'real') {
        html += "<p class='sum_sub_t'>• 학습 모델: <a class='attr_value'>" + get_city_name_kr(model) + "</a></p>"
    } else {
        html += "<p class='sum_sub_t'>• 학습 모델: <a class='attr_value'>실제 가치</a></p>"
    }
    
    min = document.getElementById('p1_min').value;
    max = document.getElementById('p1_max').value;
    html += "<p class='attr_class'> 면적 </p>";
    html += "<p class='sum_sub_t'>• 면적</p>"
    html += "<p class='sum_attr'>\n";
    html += "<a class='attr_value'>"+min + "</a> ~ <a class='attr_value'>" + max + "</a> ㎡";
    html += "</p>";
    
    summary.innerHTML = html;
}



/**************** functions for slider ****************/



/**************** UI event handle ****************/
function change_method(e) {
    'use strict';
    var i, value, method_elements;
    
    if (e.classList.length !== 2) {
        value = e.value;
        method_elements = document.getElementsByClassName('search_method');
        
        for (i = 0; i < method_elements.length; i += 1) {
            method_elements[i].classList.toggle('active');
        }
        
        if (value === 'show_value') {
            show_value_menu();
        } else {
            show_diff_menu();
        }
    }
}

function toggle_checkbox(e) {
    'use strict';
    var weight_panel, attr_symbol, w_panel, w_element, w_menu;
    
    attr_symbol = e.id.replace('_check', '');
    weight_panel = document.getElementById('weight_panel');
    
    w_panel = document.getElementById('w_' + attr_symbol + '_panel');
    w_element = document.getElementById('w_' + attr_symbol);
    
    if (e.checked) {
        w_panel.hidden = false;
        w_element.disabled = false;
    } else {
        w_panel.hidden = true;
        w_element.disabled = true;
    }
    
    w_menu = document.getElementById('weight_panel');
    
    w_menu.style.maxHeight = null;
    w_menu.style.maxHeight = w_menu.scrollHeight + 'px';
    distribute_weight();
}

function draw_slider(attribute) {
    'use strict';
    var slider, min, max, inputs;
    
    slider = document.getElementById(attribute.attr_symbol + '_bar');
    min = document.getElementById(attribute.attr_symbol + '_min');
    max = document.getElementById(attribute.attr_symbol + '_max');
    inputs = [min, max];
    
    noUiSlider.create(slider, {
        start: [attribute.attr_min, attribute.attr_max],
        connect: true,
        step: attribute.attr_step,
        range: {
            'min': attribute.attr_min,
            'max': attribute.attr_max
        }
    });
    
    slider.noUiSlider.on('update', function (values, handle) {
        inputs[handle].value = values[handle];
        //wrapWindowByMask();
    });
    
    function setSliderHandle(i, value) {
        var r = [null, null];
        r[i] = value;
        slider.noUiSlider.set(r);
    }
    
    inputs.forEach(function (input, handle) {

        input.addEventListener('change', function () {
            setSliderHandle(handle, this.value);
        });

        input.addEventListener('keydown', function (e) {

            var values = slider.noUiSlider.get();
            var value = Number(values[handle]);

            // [[handle0_down, handle0_up], [handle1_down, handle1_up]]
            var steps = slider.noUiSlider.steps();

            // [down, up]
            var step = steps[handle];

            var position;

            // 13 is enter,
            // 38 is key up,
            // 40 is key down.
            switch ( e.which ) {

                case 13:
                    setSliderHandle(handle, this.value);
                    break;

                case 38:

                    // Get step to go increase slider value (up)
                    position = step[1];

                    // false = no step is set
                    if ( position === false ) {
                        position = 1;
                    }

                    // null = edge of slider
                    if ( position !== null ) {
                        setSliderHandle(handle, value + position);
                    }

                    break;

                case 40:

                    position = step[0];

                    if ( position === false ) {
                        position = 1;
                    }

                    if ( position !== null ) {
                        setSliderHandle(handle, value - position);
                    }

                    break;
            }
        });
    });
}

function make_attr_html(attribute) {
    'use strict';
    var html;
    
    html = "";
    
    html += "\t\t<div class='attr_panel' style='background-color: #E8E8E8;padding: 0px;'>\n";
    html += "<p style='margin:0px;padding-top:10px;'>";
    
    html += attribute.attr_name;
    html += "<a class='input'><input class='input_text' type='text' id='" + attribute.attr_symbol + "_min'>";
    html += " ~ ";
    html += "<input class='input_text' type='text' id='" + attribute.attr_symbol + "_max'> ";
    html += attribute.attr_unit + "</a>";
    html += "</p>";
    
    html += "<p class='slider_wrapper'><p class='value_input' id='" + attribute.attr_symbol + "_bar'></p></p>\n";
    
    
    
    html += "\t\t</div>\n";
    
    return html;
}

function dy_menu_control(e) {
    'use strict';
    var panel;
    
    e.classList.toggle('active');
    panel = e.nextElementSibling;
    
    if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
    } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
    }
}

function make_menu_html(key, attr_class, attr_list) {
    'use strict';
    var html, i;
    
    html = "";
    
    html += "<div class='attr_name' style='border-bottom: 0px;'> 면적 </div>"
    for (i = 0; i < attr_list.length; i += 1) {
        html += make_attr_html(attr_list[i]);
    }
    
    return html;
}

function show_area_menu() {
    'use strict';
    var dy_section, html, key, i;
    
    dy_section = document.getElementById('dynamic_section');
    html = "";
    
    for (key in attr_classes) {
        if (attr_classes.hasOwnProperty(key)) {
            html += make_menu_html(key, attr_classes, attr_list[key]);
        }
    }
    
    dy_section.innerHTML = html;
    
    for (key in attr_list) {
        if (attr_list.hasOwnProperty(key)) {
            for (i = 0; i < attr_list[key].length; i += 1) {
                draw_slider(attr_list[key][i]);
            }
        }
    }
}


/**************** init functions ****************/
function saerch_method_init() {
    'use strict';
    var value_method, complex_display;
    
    value_method = document.getElementById('value_method');
    value_method.classList.toggle('active');
    
    complex_display = document.getElementById('complex_display');
    complex_display.classList.toggle('active');
    
    show_value_menu();
}

function city_select_init() {
    'use strict';
    var menu_name, menu_id;
    
    menu_name = '지 역';
    menu_id = 'city_select';
    
    set_select_menu(menu_name, menu_id, cities);
}

function model_select_init() {
    'use strict';
    show_value_menu();
}

window.onload = function () {
    'use strict';
    saerch_method_init();
    model_select_init();
    city_select_init();
    show_area_menu();
    draw_map(suwon, [], true);
    
    
};
