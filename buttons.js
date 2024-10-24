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


/* button is old api but horible to use */
const BUTTON_POS = 0
const BUTTON_CALLBACK = 1
const BUTTON_ARG = 2

/* those one try to be easier to manipulate */
const SMART_BT_POS = 0
const SMART_BT_COLOR = 1
const SMART_BT_CALLBACK = 2
const SMART_BT_ARG = 4
const SMART_BT_BG_SQUARE = 5
const SMART_BT_FG_SQUARE = 6
const SMART_BT_TXT = 7
const SMART_BT_OVER_TXT = 8

function ux_rm(wid, container, in_txt)
{
    let idx_target = -1;
    let idx = 0;

    for (c of container) {
	const txt = yeGet(c, 2)
	if (yeGetString(txt) == in_txt) {
	    idx_target = idx;
	}
	++idx;
    }

    if (idx_target > 0) {
	ywCanvasRemoveObj(wid, container.get(idx_target))
	ywCanvasRemoveObj(wid, container.get(idx_target - 1))
	ywCanvasRemoveObj(wid, container.get(idx_target - 2))
	container.rm(idx_target)
	container.rm(idx_target - 1)
	container.rm(idx_target - 2)
    }
}

function square_txt(wid, container, x, y, color, txt, fixe_w, fixe_h)
{
    const colors = color.split(' ')
    let alpha = colors[3]

    if (alpha) {
	color = colors[0] + ' ' + colors[1] + ' ' + colors[2]
    } else {
	alpha = "160"
    }
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
    if (h > 300)
	txt_y_threshold = 80
    else if (h > 40)
	txt_y_threshold = 10

    yePushBack(container,
	       ywCanvasNewRectangleExt(wid, x, y, w,
				       h, "rgba: " + color + " 255", 2))
    yePushBack(container,
	       ywCanvasNewRectangleExt(wid, x, y, w,
				       h, "rgba: " + color + " " + alpha, 3))
    yePushBack(container, ywCanvasNewTextByStr(wid, x + txt_y_threshold, y + 2, txt))
    return [w, h]
}

function print_button(button_containers, func)
{
    for (b of button_containers) {
	if (!func)
	    print(b)
	else if (func == b[BUTTON_CALLBACK])
	    print(b)
    }
}


function clear_buttons_2(wid)
{
    let smart_button = wid.get("smart_button")
    if (!smart_button)
	return

    for (let sb of smart_button) {
	ywCanvasRemoveObj(wid, sb.get(SMART_BT_BG_SQUARE))
	ywCanvasRemoveObj(wid, sb.get(SMART_BT_FG_SQUARE))
	ywCanvasRemoveObj(wid, sb.get(SMART_BT_TXT))
	ywCanvasRemoveObj(wid, sb.get(SMART_BT_OVER_TXT))
    }
    yeClearArray(smart_button)
}

function rm_button2(wid, name)
{
    let smart_button = wid.get("smart_button")

    if (!smart_button)
	return

    let sb = smart_button.get(name)

    if (!sb)
	return
    ywCanvasRemoveObj(wid, sb.get(SMART_BT_BG_SQUARE))
    ywCanvasRemoveObj(wid, sb.get(SMART_BT_FG_SQUARE))
    ywCanvasRemoveObj(wid, sb.get(SMART_BT_TXT))
    ywCanvasRemoveObj(wid, sb.get(SMART_BT_OVER_TXT))
    smart_button.rm(sb)
}

function mk_button2(wid, name, txt, x, y, color, callback, arg)
{
    const colors = color.split(' ')
    let alpha = colors[3]

    if (alpha) {
	color = colors[0] + ' ' + colors[1] + ' ' + colors[2]
    } else {
	alpha = "160"
    }


    let smart_button = wid.get("smart_button")
    if (!smart_button) {
	smart_button = yeCreateArray(wid, "smart_button")
    }

    let ret = yeLen(smart_button)
    let cnt = yeCreateArray(smart_button, name)

    ywPosCreate(x, y, cnt)
    cnt.setAt(SMART_BT_COLOR, color)
    yeCreateFunction(callback, cnt)
    cnt.setAt(SMART_BT_ARG, arg)

    const split_txt = txt.split("\n")
    let w = 0
    for (line of split_txt) {
	const tmp_w = line.length * ywidFontW() + 10
	if (tmp_w > w) {
	    w = tmp_w
	}
    }
    let h = ywidFontH() * split_txt.length + 10
    let txt_y_threshold = 2
    if (h > 300)
	txt_y_threshold = 80
    else if (h > 40)
	txt_y_threshold = 10

    cnt.setAt(SMART_BT_BG_SQUARE,
	      ywCanvasNewRectangleExt(wid, x, y, w,
				      h, "rgba: " + color + " 255", 2))
    cnt.setAt(SMART_BT_FG_SQUARE,
	      ywCanvasNewRectangleExt(wid, x, y, w,
				      h, "rgba: " + color + " " + alpha, 3))
    cnt.setAt(SMART_BT_TXT,
	      ywCanvasNewTextByStr(wid, x + txt_y_threshold, y + 2, txt))

    return ret
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
	let r = ywRectCreateInts(button[BUTTON_POS][0], button[BUTTON_POS][1],
				 button[BUTTON_POS][2], button[BUTTON_POS][3])

	if (ywRectContainPos(r, mouse_pos, 1)) {
	    if (yevAnyMouseDown(eves))
		button[BUTTON_CALLBACK](wid, button[BUTTON_ARG])
	    else {
		yePushBack(bt_highlight,
			   ywCanvasNewRectangleExt(wid, button[BUTTON_POS][0],
						   button[BUTTON_POS][1],
						   button[BUTTON_POS][2],
						   button[BUTTON_POS][3],
						   "rgba: 120 140 130 100", 3))
	    }
	}
    }

    let smart_buttons = wid.get("smart_button")
    if (!smart_buttons)
	return

    for (sb of smart_buttons) {
	if (ywCanvasObjectsCheckPointColisions(sb.get(SMART_BT_BG_SQUARE), mouse_pos)) {
	    let bt_pos = sb.get(SMART_BT_POS)
	    let bt_size = sb.get(SMART_BT_BG_SQUARE).get("rect").get(0)
	    let x = bt_pos.geti(0)
	    let y = bt_pos.geti(1)
	    let w = bt_size.geti(0)
	    let h = bt_size.geti(1)

	    if (yevAnyMouseDown(eves))
		sb.get(SMART_BT_CALLBACK).call(wid, sb.get(SMART_BT_ARG))
	    else if (!sb.get(SMART_BT_OVER_TXT)) {
		let over_bt = ywCanvasNewRectangleExt(wid, x, y, w, h,
						      "rgba: 120 140 130 100", 3)
		sb.setAt(SMART_BT_OVER_TXT, over_bt)
	    }
	} else if (mouse_pos && !no_clean && sb.get(SMART_BT_OVER_TXT)) {
	    ywCanvasRemoveObj(wid, sb.get(SMART_BT_OVER_TXT))
	    sb.rm(SMART_BT_OVER_TXT)
	}
    }
}

function ok_text(wid, txt, func, arg)
{
    let ok_ux = yeTryCreateArray(wid, "ok_ux")

    // if not string assuming entity
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
