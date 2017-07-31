/*jslint devel: true */

var cites = [
    {suwon : "수원"},
    {gunpo : "군포"},
    {anyang : "안양"}
];
var attribute_classes = {
    area : "면적", 
    physical : "물리적 속성",
    locational : "위치 접근성",
    nearby : "주변 환경"
};
var attributes = {
    area : [
        {attr_name : "면적", attr_symbol : "p1", attr_min : 0, attr_max : 250, attr_step : 1, attr_unit : "㎡"}
    ],
    physical : [
        {attr_name : "노후도", attr_symbol : "p18", attr_min : 0, attr_max : 1600, attr_step : 1, attr_unit: "개월", type : "float"},
        {attr_name : "총세대 수", attr_symbol : "p19", attr_min : 0, attr_max : 3500, attr_step : 1, attr_unit: "세대", type : "int"},
        {attr_name : "아파트 브랜드", attr_symbol : "p26", attr_min : 0, attr_max : 25, attr_step : 1, attr_unit: "점", type : "int"},
        {attr_name : "초등학교 도보시간", attr_symbol : "p27", attr_min : 0, attr_max : 30, attr_step : 1, attr_unit: "분", type : "int"}
    ],
    locational : [
        {attr_name : "강남역까지 거리", attr_symbol : "l1", attr_min : 0, attr_max : 20000, attr_step : 1, attr_unit: "m", type : "float"},
        {attr_name : "고속도로 IC까지 거리", attr_symbol : "l2", attr_min : 0, attr_max : 5000, attr_step : 1, attr_unit: "m", type : "float"},
        {attr_name : "지하철역까지 거리", attr_symbol : "l3",  attr_min : 0, attr_max : 4000, attr_step : 1, attr_unit: "m", type : "float"},
        {attr_name : "200m내 버스정류장 수", attr_symbol : "l4", attr_min : 0, attr_max : 50, attr_step : 1, attr_unit: "개", type : "int"},
        {attr_name : "버스정류장까지 거리", attr_symbol : "l5", attr_min : 0, attr_max : 500, attr_step : 1, attr_unit: "m", type : "float"}
    ],
    nearby : [
        {attr_name : "종합병원까지 거리", attr_symbol : "n1", attr_min : 0, attr_max : 7000, attr_step : 1, attr_unit: "m", type : "float"},
        {attr_name : "대형마트까지 거리", attr_symbol : "n2", attr_min : 0, attr_max : 4000, attr_step : 1, attr_unit: "m", type : "float"},
        {attr_name : "백화점까지 거리", attr_symbol : "n3", attr_min : 0, attr_max : 8000, attr_step : 1, attr_unit: "m", type : "float"},
        {attr_name : "공원까지 거리", attr_symbol : "n4", attr_min : 0, attr_max : 12000, attr_step : 1, attr_unit: "m", type : "float"},
        {attr_name : "임대아파트까지 거리", attr_symbol : "n8", attr_min : 0, attr_max : 7000, attr_step : 1, attr_unit: "m", type : "float"}
    ]
};
/**/

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

function make_weight_html(attribute) {
    'use strict';
    var html;
    
    html = "";
    
    html += "<div class='weight_panel' id='w_" + attribute.attr_symbol + "_panel'hidden>\n";
    html += attribute.attr_name + "\n";
    html += "<a class='percent'>%</a><input type='text' class='weight_input' id='w_" + attribute.attr_symbol + "' value='0' disabled> \n";
    html += "</div>\n";
    
    return html;
    
}

function make_weight_panel_html() {
    'use strict';
    var html, key, i;
    
    html = "";
    
    html += "<button class='accordion' onclick='dy_menu_control(this)'> 가중치 </button>\n";
    html += "\t<div class='panel' id='weight_panel'>\n";
    
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            for (i = 0; i < attributes[key].length; i += 1) {
                html += make_weight_html(attributes[key][i]);
            }
        }
    }
    
    html += "</div>";
    
    return html;
}

function make_attr_html(attribute) {
    'use strict';
    var html;
    
    html = "";
    
    html += "\t\t<div class='attr_panel'>\n";
    html += "<p>";
    
    if (attribute.attr_symbol !== 'p2' && attribute.attr_symbol !== 'p1') {
        html += "\t\t\t<input type='checkbox' id='" + attribute.attr_symbol + "_check' onclick='toggle_checkbox(this)'>";
    }
    
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

function make_menu_html(key, attr_class, attr_list) {
    'use strict';
    var html, i;
    
    html = "";
    
    html += "<button class='accordion' onclick='dy_menu_control(this)'> " + attr_class[key] + " </button>\n";
    html += "\t<div class='panel'>\n";
    
    for (i = 0; i < attr_list.length; i += 1) {
        html += make_attr_html(attr_list[i]);
    }
    
    html += "</div>";
    
    return html;
}

function show_attr_menu() {
    'use strict';
    var dy_section, html, key, i;
    
    dy_section = document.getElementById('dynamic_section');
    html = "";
    
    for (key in attribute_classes) {
        if (attribute_classes.hasOwnProperty(key)) {
            html += make_menu_html(key, attribute_classes, attributes[key]);
        }
    }
    
    html += make_weight_panel_html();
    
    dy_section.innerHTML = html;
    
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            for (i = 0; i < attributes[key].length; i += 1) {
                draw_slider(attributes[key][i]);
            }
        }
    }
}

function show_p2_menu() {
    'use strict';
    var attr_classes, attr_list, dy_section, html, key, i;
    
    dy_section = document.getElementById('dynamic_section');
    html = "";
    
    attr_classes = { 
        area : "면적",
        p2_only : "㎡당 가격",
         
    };
    
    attr_list = {
        p2_only : [
            {attr_name : "㎡당 가격", attr_symbol : "p2", attr_min : 0, attr_max : 1000, attr_step : 1, attr_unit : "만원"}
        ],
        area : [
            {attr_name : "면적", attr_symbol : "p1", attr_min : 0, attr_max : 250, attr_step : 1, attr_unit : "㎡"}
        ]
                };
    
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





function get_abled_weights() {
    'use strict';
    var w_elements, w_id, w_element, key, i;
    
    w_elements = [];
    
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            for (i = 0; i < attributes[key].length; i += 1) {
                w_id = 'w_' + attributes[key][i].attr_symbol;
                w_element = document.getElementById(w_id);
                
                if (!w_element.disabled) {
                    w_elements.push(w_element);
                }
            }
        }
    }
    
    if (w_elements.length > 0) {
        return w_elements;
    }
    
    return null;
}

function distribute_weight() {
    'use strict';
    var w_elements, weight, last, i;
    
    weight = 0;
    last = 0;
    w_elements = get_abled_weights();
    
    if (!w_elements) {
        return;
    }
    
    weight = parseInt(100 / w_elements.length, 10);
    last = 100 - weight * (w_elements.length - 1);
    
    for (i = 0; i < w_elements.length - 1; i += 1) {
        w_elements[i].value = weight;
    }
    
    w_elements[w_elements.length - 1].value = last;
}

function make_summary_html(attribute) {
    'use strict';
    var html, min, max, weight;
    
    min = document.getElementById(attribute.attr_symbol + '_min').value;
    max = document.getElementById(attribute.attr_symbol + '_max').value;
    
    weight = document.getElementById('w_' + attribute.attr_symbol).value;
    
    
    html = "";
    
    html += "<p class='sum_sub_t'>• " + attribute.attr_name + "(<a class='attr_name'>" + weight + "</a>)" + "</p>";
    html += "<p class='sum_attr'>\n";
    html += "<a class='attr_value'>"+min + "</a> ~ <a class='attr_value'>" + max + "</a> " + attribute.attr_unit;
    html += "</p>";
    
    return html;
}

function update_summary(search_method) {
    'use strict';
    var summary, html, key, min, max, printed_key, i;
    
    printed_key = [];
    
    html = "";
    summary = document.getElementById('summary_div');
    
    if (search_method === 'p2_only') {
        min = document.getElementById('p1_min').value;
        max = document.getElementById('p1_max').value;
        html += "<p class='attr_class'> 면적 </p>";
        html += "<p class='sum_sub_t'>• 면적</p>"
        html += "<p class='sum_attr'>\n";
        html += "<a class='attr_value'>"+min + "</a> ~ <a class='attr_value'>" + max + "</a> ㎡";
        html += "</p>";
        
        min = document.getElementById('p2_min').value;
        max = document.getElementById('p2_max').value;
        html += "<p class='attr_class'> 물리적 속성 </p>";
        html += "<p class='sum_sub_t'>• ㎡당 가격</p>"
        html += "<p class='sum_attr'>\n";
        html += "<a class='attr_value'>"+min + "</a> ~ <a class='attr_value'>" + max + "</a> 만원";
        html += "</p>";
        
    } else {
        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                for (i = 0; i < attributes[key].length; i += 1) {
                    if (!document.getElementById('w_' + attributes[key][i].attr_symbol).disabled || key === 'area') {
                        if (printed_key.indexOf(key) === -1) {
                            printed_key.push(key);
                            html += "<p class='attr_class'>" + attribute_classes[key] + "</p>";
                        }
                        
                        html += make_summary_html(attributes[key][i]);
                    }
                }
            }
        }
    }
    
    summary.innerHTML = html;
}



/**************** functions for slider ****************/



/**************** UI event handle ****************/
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

function change_method(e) {
    'use strict';
    var i, value, method_elements;
    
    if (e.classList.length !== 2) {
        value = e.value;
        method_elements = document.getElementsByClassName('search_method');
        
        for (i = 0; i < method_elements.length; i += 1) {
            method_elements[i].classList.toggle('active');
        }
        
        if (value === 'p2_only') {
            show_p2_menu();
        } else {
            show_attr_menu();
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


/**************** init functions ****************/
function saerch_method_init() {
    'use strict';
    var p2_only_method, complex_display;
    
    p2_only_method = document.getElementById('p2_only_method');
    p2_only_method.classList.toggle('active');
    
    complex_display = document.getElementById('complex_display');
    complex_display.classList.toggle('active');
    
    show_p2_menu();
}

function city_select_init() {
    'use strict';
    var select_element, html, i, key;
    
    select_element = document.getElementById('city_select');
    html = "";
    
    html += "<option value='hide'>-------- 지 역 --------</option>\n";
    
    for (i = 0; i < cites.length; i += 1) {
        key = Object.keys(cites[i])[0];
        html += "<option value='" + key + "'> " + cites[i][key] + " </option>\n";
    }
    
    select_element.innerHTML = html;
}

window.onload = function () {
    'use strict';
    saerch_method_init();
    city_select_init();
    draw_map(suwon, [], true);
    
    
};
