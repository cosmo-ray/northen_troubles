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

function mk_button(wid, ux_cnt, bt_cnt, txt, x, y, color, callback, arg)
{
    let w_h = square_txt(wid, ux_cnt, x, y, color, txt)

    if (arg)
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

