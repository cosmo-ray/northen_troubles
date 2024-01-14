
/* need info for all guys */
/* need info for squads */
/* starting squad on contry 0 */
/* where are enemies */
/* guys base stats */
/* guys equipements */

let contry_colors = [
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

function select_country(wid, eves)
{
    let mouse_pos = yevMousePos(eves)
    let map = wid.get('map')
    let mouse_press = false

    if (yevAnyMouseDown(eves)) {
	print("[", mouse_pos.geti(0), ",", mouse_pos.geti(1), "],")
	mouse_press = true
    }

    if (mouse_pos) {
	if (wid.get("can_col")) {
	    ywCanvasRemoveObj(wid, wid.get("can_col"))
	    wid.rm("can_col")
	}

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
		if (mouse_press)
		    wid.setAt("selected_country", i)
	    }
	})
    }
}

let main_buttons = []

function country_action(wid, eves, selected_country)
{
    let map = wid.get("map")
    let wid_pix = yeGet(wid, "wid-pix");

    let country_ux = wid.get("country_ux")
    if (!country_ux) {
	country_ux = yeCreateArray(wid, "country_ux")

	/* contry name */
	let name_size = 100
	let name = yeGetKeyAt(map, selected_country.i())
	if (name.length > 10)
	    name_size = 150
	print(name.length)

	yePushBack(country_ux,
		   ywCanvasNewRectangleExt(wid, 10, 10, name_size,
					   30, "rgba: 20 40 230 255", 2))
	yePushBack(country_ux,
		   ywCanvasNewRectangleExt(wid, 10, 10, name_size,
					   30, "rgba: 20 40 230 100", 3))
	yePushBack(country_ux, ywCanvasNewTextByStr(wid, 12, 12, name))

	/* back */
	yePushBack(country_ux,
		   ywCanvasNewRectangleExt(wid, ywRectW(wid_pix) - 70, 10, 60, 30,
					   "rgba: 120 140 130 255", 2))
	yePushBack(country_ux,
		   ywCanvasNewRectangleExt(wid, ywRectW(wid_pix) - 70, 10, 60, 30,
					   "rgba: 120 140 130 100", 3))
	yePushBack(country_ux, ywCanvasNewTextByStr(wid, ywRectW(wid_pix) - 68, 12, "Back"))
	main_buttons.push([[ywRectW(wid_pix) - 70, 10, 60, 30], back])
    }

    let mouse_pos = yevMousePos(eves)

    if (mouse_pos)
	if (wid.get("bt_highlight")) {
	    ywCanvasRemoveObj(wid, wid.get("bt_highlight"))
	    wid.rm("bt_highlight")
	}

    for (button of main_buttons) {
	let r = ywRectCreateInts(button[0][0], button[0][1], button[0][2], button[0][3])

	print(ywRectContainPos(r, mouse_pos, 1))
	if (ywRectContainPos(r, mouse_pos, 1)) {
	    if (yevAnyMouseDown(eves))
		button[1](wid)
	    else {
		wid.setAt("bt_highlight",
			  ywCanvasNewRectangleExt(wid, button[0][0], button[0][1],
						  button[0][2], button[0][3],
						  "rgba: 120 140 130 100", 3))
	    }
	}
    }

}

function back(wid)
{
    main_buttons = []
    wid.get("country_ux").forEach(function(c, i) {
	ywCanvasRemoveObj(wid, c)
    })
    wid.rm("country_ux")
    wid.rm("selected_country")
}

function nt_action(wid, eves)
{
    let selected_country = wid.get("selected_country")

    if (!selected_country)
	return select_country(wid, eves)

    return country_action(wid, eves, selected_country)
}

function nt_init(wid, map_str)
{
    yeConvert(wid, YHASH)

    yeCreateFunction(nt_action, wid, "action")
    yeCreateString("rgba: 255 255 255 255", wid, "background")

    let ret = ywidNewWidget(wid, "canvas")
    const wid_rect = wid.get("wid-pix");
    const bg_size = ywSizeCreate(ywRectW(wid_rect), ywRectH(wid_rect))


    let map = ygFileToEnt(YJSON, "./map.json")
    let units = ygFileToEnt(YJSON, "./units.json")

    yePrint(units)

    wid.setAt("imgbg", ywCanvasNewImgByPath(wid, 0, 0, "./map.png"));
    ywCanvasForceSize(wid.get("imgbg"), bg_size)
    ywSetTurnLengthOverwrite(-1)

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
	    let sq = yeCreateHash(sqs, "guards")

	    sq.setAt("faction", "neutral")
	    let guys = yeCreateArray(sq, "guys")
	    yeCreateCopy(units.get("guard"), guys)
	    if (state_size == 2 || sate_size == 3) {
		yeCreateCopy(units.get("guard"), guys)
		yeCreateCopy(units.get("guard"), guys)
		yeCreateCopy(units.get("guard"), guys)
		yeCreateCopy(units.get("guard"), guys)
		yeCreateCopy(units.get("guard"), guys)
	    } else if (state_size == 1) {
		yeCreateCopy(units.get("peasant"), guys)
		yeCreateCopy(units.get("peasant"), guys)
		yeCreateCopy(units.get("peasant"), guys)
		yeCreateCopy(units.get("guard"), guys)
		yeCreateCopy(units.get("peasant"), guys)
	    }
	} else if (state.gets("type") == "field") {
	    let sq = yeCreateHash(sqs, "guards")

	    let guys = yeCreateArray(sq, "guys")
	    if (state_size == 0) {
		sq.setAt("faction", "neutral")
		yeCreateCopy(units.get("peasant"), guys)
		yeCreateCopy(units.get("peasant"), guys)
		yeCreateCopy(units.get("peasant"), guys)
	    } else {
		sq.setAt("faction", "bad")
		yeCreateCopy(units.get("orc"), guys)
		yeCreateCopy(units.get("orc"), guys)
		yeCreateCopy(units.get("orc"), guys)
		yeCreateCopy(units.get("orc"), guys)
	    }
	}
	if (i == 0) {
	    let sq = yeCreateHash(sqs, "squad Nb-1")

	    sq.setAt("faction", "good")
	    let guys = yeCreateArray(sq, "guys")
	    for (let i = 0; i < 6; ++i)
		yeCreateCopy(units.get("guard"), guys)
	}
	yePrint(sqs)
    })

    return ret
}

function mod_init(mod)
{
    ygInitWidgetModule(mod, "northen-troubles", yeCreateFunction("nt_init"))
    return mod
}
