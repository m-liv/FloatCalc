import init, { decimal_to_result, binstr_to_result, hexstring_to_result, binstr_plus, binstr_minus } from "./pkg/floatconv.js";

/* Javascript support for IEEE754 conversion *
 *
 * (c) 2023-2024 by Harald Schmidt
 *
 */

init().then(() => {
    let r = "00000000000000000000000000000000";
    update_view(binstr_to_result(r));
});

function decimal_text_changed() {
    let v = window.document.getElementById("decimal").value;
    var r = decimal_to_result(v);
    update_view(r);
}

function update_view(result) {
    if (result.error != "") {
        window.document.getElementById("convstatus").innerHTML = result.error;
    } else {
        const underflow = result.exponent == 0;
        const nan_inf = result.exponent == 0xff;

        window.document.getElementById("actual_sign").innerHTML = result.sign;
        window.document.getElementById("actual_mantissa").innerHTML = result.mantissa;
        window.document.getElementById("actual_exponent").innerHTML = result.exponent;

        if (result.sign == 1) {
            window.document.getElementById("sign_value").innerHTML = "-1";
        } else {
            window.document.getElementById("sign_value").innerHTML = "+1";
        }
        if (underflow) {
            window.document.getElementById("exponent_value").innerHTML = -126;
            window.document.getElementById("mantissa_value").innerHTML =  result.mantissa_value_without_lead;
        } else if (nan_inf) {
            window.document.getElementById("exponent_value").innerHTML = "?";
            window.document.getElementById("mantissa_value").innerHTML = "?";

        } else {
            window.document.getElementById("exponent_value").innerHTML =  (result.exponent - 127);
            window.document.getElementById("mantissa_value").innerHTML =  "1 + " + (result.mantissa_value_without_lead);
        }

        window.document.getElementById("convstatus").innerHTML = "";
        window.document.getElementById("decimal").value = result.decimal_string;
        window.document.getElementById("highprecision_decimal").value = result.full_decimal_string;
        window.document.getElementById("representation_error").value = result.conversion_error;
        window.document.getElementById("binary").value = result.binary_string;
        window.document.getElementById("hexadecimal").value = result.hex_string;
        set_bit_string(result.binary_string);
    }
}

function bits_changed() {
    let bitstring = get_bit_string();
    let r = binstr_to_result(bitstring);
    update_view(r);
}

function value_increment() {
    let bitstring = get_bit_string();
    let r = binstr_plus(bitstring);
    update_view(r);
}

function value_decrement() {
    let bitstring = get_bit_string();
    let r = binstr_minus(bitstring);
    update_view(r);
}

function binary_text_changed() {
    let v = window.document.getElementById("binary").value;
    var r = binstr_to_result(v);
    update_view(r);
}

function hexadecimal_text_changed() {
    let v = window.document.getElementById("hexadecimal").value;
    let r = hexstring_to_result(v);
    update_view(r);
}

function disable_form() {
    function ignore_submit(event) {
        event.preventDefault();
    }
    document.querySelectorAll('form').forEach(
        (node) => {
            node.addEventListener('submit', ignore_submit);
        }
    );
}


function get_bit_string() {
    let bitstring = "";
    function getCheckboxValue(elemid) {
        let cb = window.document.querySelector(elemid);
        if (cb === null) {
            alert("Invalid: " + elemid);
        }
        if (cb.checked) {
            return "1";
        } else {
            return "0";
        }
    }

    bitstring = bitstring + getCheckboxValue('#cbsign');
    for (let i = 0; i < 8; i++) {
        bitstring = bitstring + getCheckboxValue('#cbexp' + i);
    }
    for (let i = 0; i < 23; i++) {
        bitstring = bitstring + getCheckboxValue('#cbmant' + i);
    }

    return bitstring;
}

function set_bit_string(bit_string) {
    function set_checkbox_value(elemid, value) {
        let cb = window.document.querySelector(elemid);
        if (cb === null) {
            alert("Invalid: " + elemid);
        }
        cb.checked = value;
    }
    function bit_string_value_at(position) {
        return bit_string[position] == "1";
    }
    let pos = 0;
    set_checkbox_value('#cbsign', bit_string_value_at(pos++));
    for (let i = 0; i < 8; i++) {
        set_checkbox_value('#cbexp' + i, bit_string_value_at(pos++));
    }
    for (let i = 0; i < 23; i++) {
        set_checkbox_value('#cbmant' + i, bit_string_value_at(pos++));
    }
}


function attach_trigger() {
    document.querySelector('#decimalform').addEventListener('change', decimal_text_changed);

    document.querySelector('#cbsign').addEventListener('change', bits_changed);
    for (let i = 0; i < 8; i++) {
        document.querySelector('#cbexp' + i).addEventListener('change', bits_changed);
    }
    for (let i = 0; i < 23; i++) {
        document.querySelector('#cbmant' + i).addEventListener('change', bits_changed);
    }

    document.querySelector('#btincrement').addEventListener('click', value_increment);
    document.querySelector('#btdecrement').addEventListener('click', value_decrement);

    document.querySelector('#binary').addEventListener('change', binary_text_changed);
    document.querySelector('#hexadecimal').addEventListener('change', hexadecimal_text_changed);

    disable_form();
}


function start() {
    document.addEventListener("DOMContentLoaded", (event) => attach_trigger() );
}

start();
