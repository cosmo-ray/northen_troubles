//           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
//                   Version 2, December 2004
//
// Copyright (C) 2024 Matthias Gatto <uso.cosmo.ray@gmail.com>
//
// Everyone is permitted to copy and distribute verbatim or modified
// copies of this license document, and changing it is allowed as long
// as the name is changed.
//
//            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
//   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
//
//  0. You just DO WHAT THE FUCK YOU WANT TO.


function square_txt(wid, container, x, y, color, txt, fixe_w, fixe_h)
{
    const split_txt = txt.split("\n")
    let w = fixe_w
    if (!fixe_w || fixe_w == undefined) {
	w = 0
	for (line of split_txt) {
	    const tmp_w = line.length * ywidFontW() + 10
	    if (tmp_w > w) {
		w = tmp_w
	    }
	}
    }
    let h = fixe_h
    if (!fixe_h || fixe_h == undefined) {
	h = ywidFontH() * split_txt.length + 10
    }
    let txt_y_threshold = 2
    if (h > 40)
	txt_y_threshold = 10

    yePushBack(container,
	       ywCanvasNewRectangleExt(wid, x, y, w,
				       h, "rgba: " + color + " 255", 2))
    yePushBack(container,
	       ywCanvasNewRectangleExt(wid, x, y, w,
				       h, "rgba: " + color + " 100", 3))
    yePushBack(container, ywCanvasNewTextByStr(wid, x + txt_y_threshold, y + 2, txt))
    return [w, h]
}

function mk_button(wid, ux_cnt, bt_cnt, txt, x, y, color, callback, arg)
{
    let w_h = square_txt(wid, ux_cnt, x, y, color, txt)

    if (arg != undefined)
	bt_cnt.push([[x, y, w_h[0], w_h[1]], callback, arg])
    else
	bt_cnt.push([[x, y, w_h[0], w_h[1]], callback])
    return w_h
}

function check_button(wid, eves, buttons, no_clean)
{
    let mouse_pos = yevMousePos(eves)
    let bt_highlight = yeTryCreateArray(wid, "bt_highlight")

    if (mouse_pos)
	if (!no_clean) {
	    if (bt_highlight) {
		ywCanvasClearArray(wid, bt_highlight)
	    }
	}
    for (button of buttons) {
	let r = ywRectCreateInts(button[0][0], button[0][1], button[0][2], button[0][3])

	if (ywRectContainPos(r, mouse_pos, 1)) {
	    if (yevAnyMouseDown(eves))
		button[1](wid, button[2])
	    else {
		yePushBack(bt_highlight,
			   ywCanvasNewRectangleExt(wid, button[0][0], button[0][1],
						   button[0][2], button[0][3],
						   "rgba: 120 140 130 100", 3))
	    }
	}
    }
}

function ok_text(wid, txt, func, arg)
{
    let ok_ux = yeTryCreateArray(wid, "ok_ux")

    // if not string assuming entity
    print(func, arg)
    if (typeof txt != "string") {
	if (yeType(txt) == YSTRING) {
	    txt = txt.s(txt)
	} else {
	    let new_txt = ""
	    for (t of txt) {
		if (new_txt != "")
		    new_txt += "\n"
		new_txt = new_txt + t.s()
	    }
	    txt = new_txt
	}
    }
    let w_h = square_txt(wid, ok_ux, 150, 150, "100 100 100", txt)
    mk_button(wid, ok_ux, main_buttons, "Ok", 150, 150 + w_h[1] + 10, "100 100 100",
	      func, arg)
}
