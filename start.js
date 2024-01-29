
/* need info for all guys */
/* need info for squads */
/* starting squad on contry 0 */
/* where are enemies */
/* guys base stats */
/* guys equipements */

const contry_colors = [
    "rgba: 100 100 100 120",
    "rgba: 200 100 100 120",
    "rgba: 100 200 100 120",
    "rgba: 100 100 200 120",
    "rgba: 100 200 200 120",
    "rgba: 100 170 170 120",
    "rgba: 200 100 200 120",
    "rgba: 150 100 200 120",
    "rgba: 200 200 100 120",
    "rgba: 170 100 170 120",
    "rgba: 200 200 200 120"
]

const type_to_income = {
    "field": 3,
    "town": 10,
    "road": 5
}

const WAIT_ACTION = 0
const END_TURN_MOVE = 1
const END_TURN_BATTLE = 2
const END_TURN_REPORT = 3

let nt_container = null

function squad_push(wid, squad)
{
    const units = wid.get("units")
    const items = wid.get("items")
    const weapons = items.get("weapons")
    const armors = items.get("armors")
    const nb_args = arguments.length

    for (let i = 2; i < nb_args; ++i) {
	let guy = yeCreateCopy(units.get(arguments[i]), squad)
	let w = null

	if (i - 2 > 2) {
	    w = weapons.get("bow")
	} else {
	    w = weapons.get("longsword")
	}

	guy.push(w, "weapon")
	if (w.get("sprite_weapon")) {
	    guy.push(w.get("sprite_weapon"), "sprite_weapon")
	}
	if (w.get("oversize_weapon")) {
	    guy.push(w.get("oversize_weapon"), "oversize_weapon")
	}

	let a = armors.get("full leather")
	guy.push(a, "armor")
	let clothes = yeCreateArray(guy, "clothes")
	if (a.get("legs"))
	    clothes.push(a.get("legs"))
	if (a.get("torso"))
	    clothes.push(a.get("torso"))
	if (a.get("head"))
	    clothes.push(a.get("head"))
	if (a.get("feet"))
	    clothes.push(a.get("feet"))
    }
}

function new_squad(sqs, name)
{
    let sq = yeCreateHash(sqs, name)
    sq.setAt("have_move", 0)
    return sq
}

let main_buttons = []
let to_buttons = []

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
	let w_h = square_txt(wid, ux, ywRectW(wid_pix) - 80, 10, "120 140 130", "End Turn")

	main_buttons.push([[ywRectW(wid_pix) - 80, 10, w_h[0], w_h[1]], end_turn])

	square_txt(wid, ux, 10, 10, "120 140 130", "wealth: " + wid.geti("wealth"))
    }

    if (mouse_pos) {
	if (wid.get("can_col")) {
	    ywCanvasRemoveObj(wid, wid.get("can_col"))
	    wid.rm("can_col")
	}

	check_button(wid, eves, main_buttons)
	map.forEach(function(contry, i) {
	    let poly = contry.get("where")
	    let have_col_x = false
	    let have_col_y = false

	    if (ywPosX(mouse_pos) < ywPosX(poly.get(0)) ||
		ywPosY(mouse_pos) < ywPosY(poly.get(0)))
		return;

	    for (let j = 1; j < yeLen(poly); ++j) {
		if (ywPosX(mouse_pos) < ywPosX(poly.get(j)))
		    have_col_x = true
		if (ywPosY(mouse_pos) < ywPosY(poly.get(j)))
		    have_col_y = true
	    }
	    if (have_col_x && have_col_y) {
		print("can col: ", yeGetKeyAt(map, i))
		wid.setAt("can_col", ywCanvasNewPolygonExt(wid, poly, contry_colors[i], 1))
		if (mouse_press) {
		    wid.setAt("selected_country", i)
		    wid.get("select_ux").forEach(function(c, i) {
			ywCanvasRemoveObj(wid, c)
		    })
		    main_buttons = []
		}
	    }
	})
    }
}

function reset_flags(wid)
{
    let all_flags = yeTryCreateArray(wid, "all_flags")
    let squads_per_state = yeGet(wid, "squads")
    let flag_size = ywSizeCreate(25, 25)
    let states = wid.get("map")

    ywCanvasClearArray(wid, all_flags)

    squads_per_state.forEach(function (squads, k) {
	let flag_type = null
	let state = states.get(k)
	let x = state.get("where").get(0).geti(0)
	let y = state.get("where").get(0).geti(1)

	for (let j = 0; j < yeLen(squads); ++j) {
	    let f_name = squads.get(j).gets("faction") + "_flag";

	    print(f_name)
	    let f = ywCanvasNewImgFromTexture(wid, x, y, wid.get(f_name))
	    all_flags.push(f)
	    ywCanvasForceSize(f, flag_size)
	    x = x + 30
	}

    })
}

function square_txt(wid, container, x, y, color, txt)
{
    const split_txt = txt.split("\n")
    let w = 0
    for (line of split_txt) {
	const tmp_w = line.length * ywidFontW() + 10
	if (tmp_w > w) {
	    w = tmp_w
	}
    }
    const h = ywidFontH() * split_txt.length + 10
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

function country_action(wid, eves, selected_country)
{
    let map = wid.get("map")
    let wid_pix = yeGet(wid, "wid-pix");

    let country_ux = wid.get("country_ux")
    if (!country_ux) {
	country_ux = yeCreateArray(wid, "country_ux")

	/* contry name */
	let name = yeGetKeyAt(map, selected_country.i())
	let squads = wid.get("squads").get(name)
	square_txt(wid, country_ux, 10, 10, "20 40 230", name)

	square_txt(wid, country_ux, 10, 50, "20 40 230", "Squades present in town:")
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
	    let w_h = square_txt(wid, country_ux, 10, s_y, color, name + " of " + size + move_to)
	    if (faction == "good") {
		main_buttons.push([[10, s_y, w_h[0], w_h[1]], sq_select, s])
	    }
	    s_y += 35
	})

	/* back */
	let w_h = square_txt(wid, country_ux, ywRectW(wid_pix) - 70, 10, "120 140 130", "Back")
	main_buttons.push([[ywRectW(wid_pix) - 70, 10, w_h[0], w_h[1]], back])
    }
    check_button(wid, eves, main_buttons)
    check_button(wid, eves, to_buttons, true)
}

function end_turn(wid)
{
    wid.setAt("game_state", END_TURN_MOVE)
}

function end_turn_report(wid)
{
    print("end turn !!")
    let wealth = wid.get("wealth")
    let all_squads = wid.get("squads")
    let map = wid.get("map")
    let added_wealth = 0
    let charge = 0


    map.forEach(function (country, i) {
	let country_name = yeGetKeyAt(map, i)
	let country_squads = all_squads.get(country_name)
	let type = country.gets("type")
	let faction_present = 0

	print("GNU ? ", country_name)
	country_squads.forEach(function (s, i) {
	    const faction = s.gets("faction")
	    if (faction == "good")
		faction_present = 1
	    else if (faction == "bad")
		faction_present = 1 << 1
	    else if (faction == "neutral")
		faction_present = 1 << 2
	})

	print("faction present: ", faction_present)
	/* good and no bad guys, neutral ignored */
	if ((faction_present & 0x5) == 1) {
	    added_wealth += type_to_income[type]
	    print("added wealth: ", type_to_income[type], type)
	}

    })
    all_squads.forEach(function (squads, country) {
	squads.forEach(function (s, i) {
	    if (s.gets("faction") == "good") {
		charge += 6
	    }
	})
    })
    wealth.add(-charge)
    wealth.add(added_wealth)
    if (wealth.i() < 0) {
	print("Warning, Negative income !!")
    }
    ywCanvasClearArray(wid, wid.get("select_ux"))
    main_buttons = []
    let msg_ux = yeTryCreateArray(wid, "msg_ux")

    turn_end_txt = "Turn end report:\n"
    turn_end_txt += "Wealth gain: " + added_wealth
    turn_end_txt += "\nTotal charge: " + charge
    let w_h = square_txt(wid, msg_ux, 150, 150, "100 100 100", turn_end_txt)
    let w_h_b = square_txt(wid, msg_ux, 150, 150 + w_h[1] + 10, "100 100 100", "Ok")
    main_buttons.push([[150, 150 + w_h[1] + 10, w_h_b[0], w_h_b[1]], back])
}

let selected_sq = null

function back(wid)
{
    main_buttons = []
    selected_sq = null
    ywCanvasClearArray(wid, wid.get("msg_ux"))
    ywCanvasClearArray(wid, wid.get("move_to_ux"))
    wid.rm("selected_country")
    ywCanvasClearArray(wid, wid.get("country_ux"))
    wid.rm("country_ux")
    to_buttons = []
}

function battle_end(wid)
{
    print("battle end")
    ywCntPopLastEntry(nt_container)
}

function do_move(wid, to)
{
    print("do move: ", to)
    yePrint(selected_sq)
    yeCreateString(to, selected_sq, "move_to")
    yePrint(selected_sq)
    back(wid)
}

function move_to(wid)
{
    let map = wid.get("map")
    let selected_country = wid.get("selected_country")
    let country = map.get(selected_country.i())
    let avaible_dest = country.get("to")
    let ux = yeTryCreateArray(wid, "move_to_ux")
    let b_y = 85

    print("move to !!")
    yePrint(avaible_dest)
    avaible_dest.forEach(function (d, i) {
	let w_h = square_txt(wid, ux, 450, b_y, "100 100 100", yeGetString(d))
	to_buttons.push([[450, b_y, w_h[0], w_h[1]], do_move, [yeGetString(d)]])
	b_y += 35
    })
}

function sq_select(wid, s)
{
    let wid_pix = yeGet(wid, "wid-pix");

    let ux = wid.get("country_ux")

    print("sq select !!", selected_sq)
    if (selected_sq) {
	main_buttons.pop()
	/* 3 element par button */
	ywCanvasArrayPop(wid, ux)
	ywCanvasArrayPop(wid, ux)
	ywCanvasArrayPop(wid, ux)
    }
    selected_sq = s
    yePrint(s)
    let w_h = square_txt(wid, ux, 300, 85, "100 100 100", "Move")

    main_buttons.push([[300, 85, w_h[0], w_h[1]], move_to])

}

function nt_action(wid, eves)
{
    let game_state = wid.geti("game_state")

    if (game_state == END_TURN_MOVE) {
	let all_squads = wid.get("squads")

	print("end_turn_move")
	all_squads.forEach(function (squads, country) {
	    squads.forEach(function (s, i) {
		if (s.gets("move_to")) {
		    print("squads ", yeGetKeyAt(squads, i), " of ", country,
			  " move to ", s.gets("move_to"))
		    //yePushBack(all_squads.get(s.gets("move_to")), s)
		    let r = yeMoveByEntity(squads, all_squads.get(s.gets("move_to")),
					   s, yeGetKeyAt(squads, i))
		}
		s.rm("move_to")
	    })
	})
	reset_flags(wid)
	wid.setAt("game_state", END_TURN_BATTLE)
	return
    } else if (game_state == END_TURN_BATTLE) {
	let all_squads = wid.get("squads")

	print("end_turn_battle")
	all_squads.forEach(function (squads, country) {
	    let good = null
	    let bad = null
	    squads.forEach(function (s, i) {
		if (good == null && s.gets("faction") == "good") {
		    good = s
		} else if (bad == null && s.gets("faction") == "bad"){
		    bad = s
		}
	    })
	    if (good && bad) {
		print("FIGHT !")
		let battle = yeCreateHash()
		let units = yeCreateArray()

		battle.setAt("<type>", "jrpg-auto")
		yeCreateFunction(battle_end, battle, "win")
		yeCreateFunction(battle_end, battle, "lose")
		units.push(good.get("guys"))
		units.push(bad.get("guys"))
		battle.setAt("units", units)
		ywPushNewWidget(nt_container, battle)
	    }
	})
	wid.setAt("game_state", END_TURN_REPORT)
	return
    } else if (game_state == END_TURN_REPORT) {
	end_turn_report(wid)
	wid.setAt("game_state", WAIT_ACTION)
	return
    }
    let selected_country = wid.get("selected_country")
    let msg_ux = wid.get("msg_ux")

    if (yeLen(msg_ux)) {
	return check_button(wid, eves, main_buttons)
    }

    if (!selected_country)
	return select_country(wid, eves)

    return country_action(wid, eves, selected_country)
}

function nt_canvas_init(wid, map_str)
{
    yeCreateFunction(nt_action, wid, "action")
    yeCreateString("rgba: 255 255 255 255", wid, "background")

    const wid_rect = wid.get("wid-pix");
    const bg_size = ywSizeCreate(ywRectW(wid_rect), ywRectH(wid_rect))


    let items = ygFileToEnt(YJSON, "./items.json")
    wid.setAt("items", items)
    let map = ygFileToEnt(YJSON, "./map.json")
    let units = ygFileToEnt(YJSON, "./units.json")

    let rect_texture = ywRectCreateInts(0, 0, 32, 32)
    ywTextureNewImg("flag_captured.png", rect_texture, wid, "neutral_flag")
    rect_texture = ywRectCreateInts(0, 32, 16, 16)
    ywTextureNewImg("flags.png", rect_texture, wid, "good_flag")
    rect_texture = ywRectCreateInts(0, 16, 16, 16)
    ywTextureNewImg("flags.png", rect_texture, wid, "bad_flag")

    wid.setAt("imgbg", ywCanvasNewImgByPath(wid, 0, 0, "./map.png"));
    ywCanvasForceSize(wid.get("imgbg"), bg_size)

    wid.setAt("wealth", 0)
    wid.setAt("game_state", WAIT_ACTION)
    yePush(wid, map, "map")
    yePush(wid, units, "units")
    let squads = yeCreateHash(wid, "squads")

    map.forEach(function (state, i) {
	if (state.get("where")) {
	    ywCanvasNewPolygonExt(wid, state.get("where"), contry_colors[i], 1)
	}
	let sqs = yeCreateArray(squads, yeGetKeyAt(map, i))
	let state_size = state.geti("size")
	if (state.gets("type") == "town") {
	    let sq = new_squad(sqs, "guards")

	    sq.setAt("faction", "neutral")
	    let guys = yeCreateArray(sq, "guys")
	    squad_push(wid, guys, "guard")
	    if (state_size == 2 || sate_size == 3) {
		squad_push(wid, guys, "guard", "guard", "guard", "guard", "guard")
	    } else if (state_size == 1) {
		squad_push(wid, guys, "peasant", "peasant", "peasant", "guard", "peasant")
	    }
	} else if (state.gets("type") == "field") {
	    if (state_size == 0) {
		let sq = new_squad(sqs, "guards")
		let guys = yeCreateArray(sq, "guys")

		sq.setAt("faction", "neutral")
		squad_push(wid, guys, "peasant", "peasant", "peasant")
	    } else {
		let sq = new_squad(sqs, "enemies")
		let guys = yeCreateArray(sq, "guys")

		sq.setAt("faction", "bad")
		squad_push(wid, guys, "orc", "orc", "orc", "orc")
	    }
	} else if (state.gets("type") == "road") {
	    let sq = new_squad(sqs, "enemies")
	    let guys = yeCreateArray(sq, "guys")

	    sq.setAt("faction", "bad")
	    squad_push(wid, guys, "bandit", "bandit", "bandit", "bandit")
	}
	if (i == 0) {
	    let sq = new_squad(sqs, "squad Nb-1")

	    sq.setAt("faction", "good")
	    let guys = yeCreateArray(sq, "guys")
	    squad_push(wid, guys, "guard", "guard", "guard", "guard", "guard", "guard")
	}
    })
    reset_flags(wid)
}

function nt_init(wid, map_str)
{
    ywSetTurnLengthOverwrite(-1)
    yeConvert(wid, YHASH)

    wid.setAt("cnt-type", "stack")
    let canvas = ywCntCreateChild(wid, "canvas")
    let ret = ywidNewWidget(wid, "container")
    nt_container = wid
    nt_canvas_init(canvas)
    return ret
}

function mod_init(mod)
{
    ygAddModule(Y_MOD_LOCAL, mod, "../auto-rpg")
    ygInitWidgetModule(mod, "northen-troubles", yeCreateFunction("nt_init"))
    return mod
}
