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


function select_country(wid, eves)
{
    let mouse_pos = yevMousePos(eves)
    let map = wid.get('map')
    let mouse_press = false

    if (yevAnyMouseDown(eves)) {
	print("[", mouse_pos.geti(0), ",", mouse_pos.geti(1), "],")
	mouse_press = true
    }

    if (main_buttons.length == 0) {
	let ux = yeTryCreateArray(wid, "select_ux")
	let wid_pix = yeGet(wid, "wid-pix");
	mk_button(wid, ux, main_buttons, "End Turn", ywRectW(wid_pix) - 80, 10,
		  "120 140 130", end_turn)

	square_txt(wid, ux, 10, 10, "120 140 130", "wealth: " + wid.geti("wealth"))
    }

    if (mouse_pos) {
	let can_col = false
	if (wid.get("can_col")) {
	    ywCanvasRemoveObj(wid, wid.get("can_col"))
	    wid.rm("can_col")
	    can_col = true
	}

	check_button(wid, eves, main_buttons)
	map.forEach(function(contry, i) {
	    let poly = contry.get("where")
	    let img = contry.get("img")

	    if (!img) {
		if (ywPosX(mouse_pos) < ywPosX(poly) ||
		    ywPosY(mouse_pos) < ywPosY(poly))
		    return;

		if (ywPosX(mouse_pos) > ywPosX(poly) + ywRectW(poly) ||
		    ywPosY(mouse_pos) > ywPosY(poly) + ywRectH(poly))
		    return
	    } else {
		let canel = contry.get("canel")

		ywCanvasRemoveColorMod(canel)
		if (!ywCanvasObjectsCheckPointColisions(canel, mouse_pos))
		    return
	    }

	    if (!img) {
		wid.setAt("can_col", ywCanvasNewRectangleByRect(wid, poly, contry_colors[i], 1))
	    } else {
		let over_color = contry.get("over-color")
		let canel = contry.get("canel")
		if (over_color) {
		    ywCanvasSetColorModRGBA(canel, over_color.geti(0), over_color.geti(1),
					    over_color.geti(2), 255);
		} else {
		    ywCanvasSetColorModRGBA(canel, 100, 100, 100, 255);
		}
	    }

	    if (mouse_press) {
		wid.setAt("selected_country", i)
		wid.get("select_ux").forEach(function(c, i) {
		    ywCanvasRemoveObj(wid, c)
		})
		main_buttons = []
	    }
	})
    }
}

function reset_countries_flags(wid)
{
    let all_flags = yeTryCreateArray(wid, "all_flags")
    let squads_per_state = yeGet(wid, "squads")
    let flag_size = ywSizeCreate(25, 25)
    let states = wid.get("map")

    ywCanvasClearArray(wid, all_flags)

    squads_per_state.forEach(function (squads, k) {
	let flag_type = null
	let state = states.get(k)
	let x = state.get("where").geti(0)
	let y = state.get("where").geti(1)

	for (let j = 0; j < yeLen(squads); ++j) {
	    if (!squads.get(j))
		continue;
	    let f_name = squads.get(j).gets("faction") + "_flag";

	    let f = ywCanvasNewImgFromTexture(wid, x, y, wid.get(f_name))
	    all_flags.push(f)
	    ywCanvasForceSize(f, flag_size)
	    x = x + 30
	}

    })
}

function country_action(wid, eves, selected_country)
{
    let map = wid.get("map")
    let wid_pix = yeGet(wid, "wid-pix");
    let have_good_guys = false

    let country_ux = wid.get("country_ux")
    if (!country_ux) {
	country_ux = yeCreateArray(wid, "country_ux")

	/* contry name */
	let name = yeGetKeyAt(map, selected_country.i())
	let squads = wid.get("squads").get(name)
	square_txt(wid, country_ux, 10, 10, "20 40 230", name)

	square_txt(wid, country_ux, 10, 50, "160 160 160", "Squades in town",
		   200, 200)
	square_txt(wid, country_ux, 200, 50, "160 160 160", "town factions relationship",
		   250, 200)
	mk_txt(wid, "poor_txt", 210, 80, "0 0 0", "poor relation:")
	mk_bar(wid, "poor_bar", 45, 210, 100, 180, "0 0 0")

	let s_y = 85
	squads.forEach(function (s, i) {
	    let name = yeGetKeyAt(squads, i)
	    let size = yeLen(s.get("guys"))
	    let color = "100 100 100"
	    let faction = s.gets("faction")
	    let move_to = s.gets("move_to")

	    if (faction == "good")
		color = "30 200 30"
	    else if (faction == "bad")
		color = "200 30 30"
	    if (move_to)
		move_to = " -> " + move_to
	    else
		move_to = ""
	    let w_h = square_txt(wid, country_ux, 20, s_y, color, name + " of " + size + move_to)
	    if (faction == "good") {
		main_buttons.push([[20, s_y, w_h[0], w_h[1]], sq_select, s])
		have_good_guys = true
	    }
	    s_y += 35
	})

	/* back */
	mk_button(wid, country_ux, main_buttons, "Back", ywRectW(wid_pix) - 70, 10,
		  "120 140 130", back)
	if (have_good_guys) {
	    mk_button(wid, country_ux, main_buttons, "Hire new Team",
		      ywRectW(wid_pix) - 200, 10, "120 140 130", hire)
	}
    }
    check_button(wid, eves, main_buttons)
    check_button(wid, eves, to_buttons, true)
}
