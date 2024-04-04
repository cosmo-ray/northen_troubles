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

const TURN_RESTORATION = 4

let nt_container = null

let main_buttons = []
let to_buttons = []

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
    mk_button(wid, msg_ux, main_buttons, "Ok", 150, 150 + w_h[1] + 10, "100 100 100", back)
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
    let good = nt_container.get("battle_good")
    let bad = nt_container.get("battle_bad")
    let squads = nt_container.get("battle_squads")
    if (is_squad_dead(good)) {
	squads.rm(good)
    } else {
	squads.rm(bad)
    }
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
	let w_h = mk_button(wid, ux, to_buttons, yeGetString(d), 450, b_y, "100 100 100",
			    do_move, [yeGetString(d)])
	b_y += 35
    })
    map.forEach( function (c, i) {
	if (i == selected_country.i())
	    return;
	for (dest of avaible_dest) {
	    if (yeGetKeyAt(map, i) == dest.s())
		return;
	}
	ux.push(ywCanvasNewRectangleByRect(wid, c.get("where"), "rgba: 60 60 60 120", 1))
    })
}

function select_guy(wid, guy)
{
    print("guy select: ", guy)
    yePrint(guy)
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

    square_txt(wid, ux, ywRectW(wid_pix) - 160, 58, "150 150 150", "Guys in Squad", 150, 500)
    let guys = s.get("guys")
    let y_g = 80
    let x_g = ywRectW(wid_pix) - 150
    for (g of guys) {
	let txt = g.gets("name") + "\n"
	txt += "PV: " + g.geti("life") + " / " + g.geti("max_life")
	square_txt(wid, ux, x_g, y_g, "100 100 100", txt)
	mk_button(wid, ux, main_buttons, txt, x_g, y_g, "100 100 100", select_guy, g)
	y_g += 60
    }


}

function nt_action(wid, eves)
{
    let game_state = wid.geti("game_state")

    if (game_state == END_TURN_MOVE) {
	let all_squads = wid.get("squads")
	let wealth = wid.geti("wealth")

	all_squads.forEach(function (squads, country) {
	    squads.forEach(function (s, i) {
		if (s.gets("faction") != "good")
		    return;
		if (s.gets("move_to")) {
		    print("squads ", yeGetKeyAt(squads, i), " of ", country,
			  " move to ", s.gets("move_to"))
		    //yePushBack(all_squads.get(s.gets("move_to")), s)
		    let r = yeMoveByEntity(squads, all_squads.get(s.gets("move_to")),
					   s, yeGetKeyAt(squads, i))
		} else {
		    print("check wheal effect");
		    for (g of s.get("guys")) {
			let life = g.get("life")

			if (wealth > 0) {
			    if (life.i() < g.geti("max_life")) {
				life.add(TURN_RESTORATION)
			    }
			} else if (wealth < -5) {
			    life.add(-1)
			}
			life.boundary(0, g.geti("max_life"))
		    }
		    if (wealth < -5) {
			if (is_squad_dead(s)) {
			    squads.rm(s)
			}
		    }
		}
	    })
	})
	reset_countries_flags(wid)
	wid.setAt("game_state", END_TURN_BATTLE)
	return
    } else if (game_state == END_TURN_BATTLE) {
	let have_lose = true
	let have_wid = true
	let all_squads = wid.get("squads")
	let early_ret = false

	print("end_turn_battle")
	all_squads.forEach(function (squads, country) {
	    let good = null
	    let bad = null
	    squads.forEach(function (s, i) {
		s.rm("move_to")
		if (good == null && s.gets("faction") == "good") {
		    have_lose = false
		    good = s
		} else if (bad == null && s.gets("faction") == "bad"){
		    have_win = false
		    print("did not lose")
		    bad = s
		}
	    })
	    if (good && bad) {
		print("FIGHT !", have_win, have_lose)
		let battle = yeCreateHash()
		let units = yeCreateArray()
		nt_container.setAt("battle_good", good)
		nt_container.setAt("battle_bad", bad)
		nt_container.setAt("battle_squads", squads)

		battle.setAt("<type>", "jrpg-auto")
		yeCreateFunction(battle_end, battle, "win")
		yeCreateFunction(battle_end, battle, "lose")
		units.push(good.get("guys"))
		units.push(bad.get("guys"))
		battle.setAt("units", units)
		ywPushNewWidget(nt_container, battle)
		early_ret = true
		return true
	    }
	})
	if (early_ret)
	    return
	wid.setAt("game_state", END_TURN_REPORT)
	reset_countries_flags(wid)
	print("out fight : ", have_win, have_lose)
	if (have_win) {
	    print("norther tale win !")
	    ygCallFuncOrQuit(wid, "win");
	} else if (have_lose) {
	    print("norther tale lose !")
	    ygCallFuncOrQuit(wid, "lose");
	}
	return
    } else if (game_state == END_TURN_REPORT) {
	end_turn_report(wid)
	wid.setAt("game_state", WAIT_ACTION)
	return
    }
    let selected_country = wid.get("selected_country")
    let msg_ux = wid.get("msg_ux")
    let move_to_ux = wid.get("move_to_ux")

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
	let where = state.get("where")
	if (where) {
	    ywCanvasNewRectangleByRect(wid, state.get("where"), contry_colors[i], 1)
	    let where_txt = yeCreateCopy(where)

	    ywPosAddXY(where_txt, 10, 20)
	    ywCanvasNewTextByStr(wid, where_txt.geti(0), where_txt.geti(1), yeGetKeyAt(map, i))
	}
	let sqs = yeCreateArray(squads, yeGetKeyAt(map, i))
	let state_size = state.geti("size")
	if (state.gets("type") == "town") {
	    let sq = new_squad(sqs, "guards")

	    sq.setAt("faction", "neutral")
	    let guys = yeCreateArray(sq, "guys")
	    squad_push(wid, guys, "guard")
	    if (state_size == 2 || state_size == 3) {
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
	    //squad_push(wid, guys, "bandit", "bandit");
	    if (state_size == 0)
		squad_push(wid, guys, "bandit", "bandit", "bandit");
	    else if (state_size == 1)
		squad_push(wid, guys, "bandit", "bandit", "bandit", "bandit");
	    else if (state_size == 2)
		squad_push(wid, guys, "bandit", "orc", "bandit", "bandit", "bandit");
	    else
		squad_push(wid, guys, "bandit", "orc", "bandit", "orc", "bandit", "orc");
	}
	if (i == 0) {
	    let sq = new_squad(sqs, "squad Nb-1")

	    sq.setAt("faction", "good")
	    let guys = yeCreateArray(sq, "guys")
	    squad_push(wid, guys, "guard", "guard", "guard", "guard", "guard", "guard")
	}
    })
    reset_countries_flags(wid)
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
    yeCreateQuadInt2(1024, 600, mod, "window size")
    ygAddModule(Y_MOD_LOCAL, mod, "auto-rpg")
    ygInitWidgetModule(mod, "northen-troubles", yeCreateFunction("nt_init"))
    ysLoadFile(ygGetManager("js"), "buttons.js");
    ysLoadFile(ygGetManager("js"), "squads.js");
    ysLoadFile(ygGetManager("js"), "countries.js");
    return mod
}
