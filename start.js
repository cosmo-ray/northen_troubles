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
const END_TURN_EVENTS = 4
const STORY_STATE = 5
const WAIT_BUTTON_IN = 6

const TURN_HP_RESTORATION = 4

let nt_container = null

let main_buttons = []
let to_buttons = []

function end_turn(wid)
{
    print("end turn")
    yePrint(wid.get("arrow_array"))
    ywCanvasClearArray(wid, wid.get("arrow_array"))
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
	country_squads.forEachNonNull(function (s, i) {
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
    all_squads.forEachNonNull(function (squads, country) {
	squads.forEachNonNull(function (s, i) {
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
    ok_text(wid, turn_end_txt, back_to_state, WAIT_ACTION)
}

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
    clear_buttons_2(wid)
    ywCanvasClearArray(wid, wid.get("ok_ux"))
}

function back_to_state(wid, next_state)
{
    wid.setAt('game_state', next_state)
    back(wid)
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

let selected_sq = null

function do_move(wid, to)
{
    let map = wid.get("map")
    let to_info = map.get(to[0])
    print("do move")
    yePrint(to_info.get("where"))
    const where = to_info.get("where")
    const selected_country = wid.get("selected_country")
    print("selected_country:")
    const from_where = map.get(selected_country.i()).get("where")
    yePrint(from_where)
    //yePrint(selected_sq)
    draw_arrow(wid, wid.get("arrow_array"),
	       from_where.geti(0) + from_where.geti(2) / 2,
	       from_where.geti(1) + from_where.geti(3) / 3,
	       where.geti(0) + where.geti(2) / 2,
	       where.geti(1) + where.geti(3) / 3,
	       "rgba: 20 20 20 255")
    yeCreateString(to, selected_sq, "move_to")
    yePrint(selected_sq)
    back(wid)
}

function nt_action(wid, eves)
{
    let game_state = wid.geti("game_state")
    let mod = ygGet("northen_troubles")

    mod.setAt("active_widget", wid)
    if (game_state == STORY_STATE) {
	print("game_stat")
	let cur_story = wid.gets("cur_story")
	let story = wid.get("stories").get(cur_story)

	if (story == undefined) {
	    print("can find story: ", cur_story)
	    wid.setAt("game_state", WAIT_ACTION)
	}
	ok_text(wid, story, back_to_state, WAIT_ACTION)
	wid.setAt("game_state", WAIT_BUTTON_IN)
	return
    } else if (game_state == WAIT_BUTTON_IN) {
	check_button(wid, eves, main_buttons)
	return
    } else if (game_state == END_TURN_MOVE) {
	let all_squads = wid.get("squads")
	let wealth = wid.geti("wealth")

	all_squads.forEach(function (squads, country) {
	    squads.forEach(function (s, i) {
		if (s.gets("faction") != "good")
		    return;
		if (s.gets("move_to")) {
		    //print("squads ", yeGetKeyAt(squads, i), " of ", country,
		    //" move to ", s.gets("move_to"))
		    //yePushBack(all_squads.get(s.gets("move_to")), s)
		    let r = yeMoveByEntity(squads, all_squads.get(s.gets("move_to")),
					   s, yeGetKeyAt(squads, i))
		} else {
		    print("check wheal effect");
		    for (let g of s.get("guys")) {
			let life = g.get("life")

			if (wealth > 0) {
			    if (life.i() < g.geti("max_life")) {
				life.add(TURN_HP_RESTORATION)
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
	    squads.forEachNonNull(function (s, i) {
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
	wid.setAt("game_state", END_TURN_EVENTS)
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
    } else if (game_state == END_TURN_EVENTS) {
	let event = null
	let squads = wid.get("squads")
	let action_squad = null
	let have_good_guys = false
	while (have_good_guys == false) {
	    action_squad = yeGetRandomElem(squads)
	    for (let s of action_squad) {
		if (s.gets("faction") == "good") {
		    let map = wid.get("map")
		    let active_country = map.get(yeHashKey(squads, action_squad))
		    mod.setAt("active_country", active_country)
		    let is_condition_ok = false
		    while (is_condition_ok == false) {
			event = yeGetRandomElem(wid.get("events"))
			let condition = event.get("conditions")
			if (!condition || yeCheckCondition(condition)) {
			    is_condition_ok = true
			}
		    }
		    have_good_guys = true
		}
	    }
	}
	print("action s name:", yeHashKey(squads, action_squad));
	yePrint(event)
	yePrint(ygGet("northen_troubles.active_country.poor_relation"))
	yePrint(ygGet("northen_troubles.active_country.noble_relation"))

	ywidActions(wid, event)

	yePrint(ygGet("northen_troubles.active_country.noble_relation"))
	yePrint(ygGet("northen_troubles.active_country.poor_relation"))
	ok_text(wid, event.gets("txt"), back_to_state, END_TURN_REPORT)
	wid.setAt("game_state", WAIT_BUTTON_IN)
	return
    } else if (game_state == END_TURN_REPORT) {
	end_turn_report(wid)
	wid.setAt("game_state", WAIT_BUTTON_IN)
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

function nt_canvas_init(wid, map_img)
{
    yeCreateFunction(nt_action, wid, "action")
    yeCreateString("rgba: 255 255 255 255", wid, "background")

    const wid_rect = wid.get("wid-pix");
    const bg_size = ywSizeCreate(ywRectW(wid_rect), ywRectH(wid_rect))

    let items = ygFileToEnt(YJSON, "./items.json")
    wid.setAt("items", items)
    let map = ygFileToEnt(YJSON, "./map.json")
    let units = ygFileToEnt(YJSON, "./units.json")
    let stories = ygFileToEnt(YJSON, "./stories.json")
    let events = ygFileToEnt(YJSON, "./events.json")

    let rect_texture = ywRectCreateInts(0, 0, 32, 32)
    ywTextureNewImg("flag_captured.png", rect_texture, wid, "neutral_flag")
    rect_texture = ywRectCreateInts(0, 32, 16, 16)
    ywTextureNewImg("flags.png", rect_texture, wid, "good_flag")
    rect_texture = ywRectCreateInts(0, 16, 16, 16)
    ywTextureNewImg("flags.png", rect_texture, wid, "bad_flag")

    print("map-img: ", wid.gets("map-img"))
    let map_src = null
    let map_str = null
    if (yeType(map_img) != YSTRING) {
	map_src = map_img.get(1)
	map_str = map_img.gets(0)
    } else {
	map_str = map_img.s()
    }
    wid.setAt("imgbg", ywCanvasNewImg(wid, 0, 0, map_str, map_src));
    ywCanvasForceSize(wid.get("imgbg"), bg_size)

    yeCreateArray(wid, "arrow_array")
    wid.setAt("wealth", 0)
    wid.setAt("game_state", STORY_STATE)
    wid.setAt("cur_story", "begin")
    yePush(wid, map, "map")
    yePush(wid, units, "units")
    yePush(wid, stories, "stories")
    yePush(wid, events, "events")
    let squads = yeCreateHash(wid, "squads")

    map.forEach(function (state, i) {
	let where = state.get("where")
	if (where) {
	    let img = state.get("img")
	    if (img) {
		let src = null
		let x = where.geti(0), y = where.geti(1)

		if (yeType(map_img) != YSTRING) {
		    src = img.get(1)
		    img = img.get(0)
		}

		if (state.get("over-background")) {
		    x = 0;
		    y = 0;
		}

		let canel = ywCanvasNewImg(wid, x, y, img.s(), src)
		state.push(canel, "canel")
		if (state.get("over-background")) {
		    const bg_size = ywSizeCreate(ywRectW(wid_rect), ywRectH(wid_rect))
		    ywCanvasForceSize(canel, bg_size)
		}
	    } else {
		ywCanvasNewRectangleByRect(wid, state.get("where"), contry_colors[i], 1)
	    }
	    let where_txt = yeCreateCopy(where)

	    if (!state.get("no_name")) {
		ywPosAddXY(where_txt, 10, 20)
		ywCanvasNewTextByStr(wid, where_txt.geti(0), where_txt.geti(1), yeGetKeyAt(map, i))
	    }
	}
	let sqs = yeCreateArray(squads, yeGetKeyAt(map, i))
	let state_size = state.geti("size")
	if (state.gets("type") == "town") {
	    state.setAt("poor_relation", 50)
	    state.setAt("guard_relation", 50)
	    state.setAt("noble_relation", 50)
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
	    state.setAt("poor_relation", 50)
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
	    state.setAt("poor_relation", 50)
	    state.setAt("guard_relation", 50)
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

function nt_init(wid)
{
    ywSetTurnLengthOverwrite(-1)
    yeConvert(wid, YHASH)

    wid.setAt("cnt-type", "stack")
    let canvas = ywCntCreateChild(wid, "canvas")
    let ret = ywidNewWidget(wid, "container")
    nt_container = wid
    nt_canvas_init(canvas, wid.get("map-img"))
    return ret
}

function mod_init(mod)
{
    yeCreateQuadInt2(1024, 600, mod, "window size")
    ygAddModule(Y_MOD_LOCAL, mod, "auto-rpg")
    let test_wid = ygInitWidgetModule(mod, "northen-troubles", yeCreateFunction("nt_init"))
    let map_img = yeCreateArray(test_wid, "map-img")
    map_img.setAt(0, "./northern_isle.png")
    ywRectCreateInts(1900, 1860, 1900, 2300, map_img)
    //test_wid.setAt("map-img", "./northern_isle.png")
    yePrint(test_wid)
    ysLoadFile(ygGetManager("js"), "arrow.js");
    ysLoadFile(ygGetManager("js"), "buttons.js");
    ysLoadFile(ygGetManager("js"), "squads.js");
    ysLoadFile(ygGetManager("js"), "countries.js");
    return mod
}
