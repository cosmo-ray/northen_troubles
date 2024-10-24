
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

const NEW_UNIT_COST = 6

let good_squads_cnt = 1

function move_to(wid)
{
    let map = wid.get("map")
    let selected_country = wid.get("selected_country")
    let country = map.get(selected_country.i())
    let avaible_dest = country.get("to")
    let ux = yeTryCreateArray(wid, "move_to_ux")
    let b_y = 450

    avaible_dest.forEach(function (d, i) {
	let w_h = mk_button(wid, ux, to_buttons, yeGetString(d), 250, b_y, "100 100 100",
			    do_move, [yeGetString(d)])
	b_y += 35
    })
    map.forEach( function (c, i) {
	if (i == selected_country.i())
	    return;
	for (let dest of avaible_dest) {
	    if (yeGetKeyAt(map, i) == dest.s())
		return;
	}
	ux.push(ywCanvasNewRectangleByRect(wid, c.get("where"), "rgba: 60 60 60 120", 1))
    })
}

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
	let type = null

	if (i - 2 > 2) {
	    type = "bow"
	} else {
	    if (yuiRand() & 1) {
		type = "iron longsword"
	    } else {
		type = "iron spear"
	    }
	}
	w = weapons.get(type)
	yeReCreateString(type, w, "name")

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

function hire(wid)
{
    let wealth = wid.get("wealth")

    if (wealth.i() < 0) {
	print("not enough money")
	return
    }
    wealth.add(-NEW_UNIT_COST)
    let selected_country = wid.get("selected_country")
    let all_squads = wid.get("squads")
    let map = wid.get('map')
    let squads = all_squads.get(yeGetKeyAt(map, selected_country.i()))
    ++good_squads_cnt
    let sq = new_squad(squads, "squad Nb-" + good_squads_cnt)

    sq.setAt("faction", "good")
    let guys = yeCreateArray(sq, "guys")
    squad_push(wid, guys, "guard", "guard", "guard", "guard", "guard", "guard")

    back(wid)
}

function is_squad_dead(squad)
{
    for (let g of squad.get("guys")) {
	if (g.geti("life") > 0) {
	    return false;
	}
    }
    return true;
}

const STEEL_UPGRADE_COST = 2

function upgrade_guy_weapon(wid, args)
{
    let guy = args.get(0)
    let txt = args.get(1)
    const weapon_name = guy.get("weapon").gets("name")
    const items = wid.get("items")
    const weapons = items.get("weapons")
    let wealth = wid.get("wealth")

    if (weapon_name == "iron longsword") {
	w = weapons.get("steel longsword")
	yeReCreateString("steel longsword", w, "name")
	wealth.add(-STEEL_UPGRADE_COST)
	guy.setAt("weapon", w)
    } else if (weapon_name == "iron spear") {
	w = weapons.get("steel spear")
	yeReCreateString("steel spear", w, "name")
	wealth.add(-STEEL_UPGRADE_COST)
	guy.setAt("weapon", w)
    }

    rm_button2(wid, "upgrade-weapon")
    print("Upgrade Weapon !")
}

function select_guy(wid, guy)
{
    rm_button2(wid, "upgrade-weapon")

    let wealth = wid.get("wealth")

    if (wealth.i() < 0) {
	print("not enough money to upgrade stuff")
	return
    }
    const weapon_name = guy.get("weapon").gets("name")
    if (weapon_name == "iron longsword" || weapon_name == "iron spear") {

	print("can upgrade ", guy.gets("name"))
	const txt = "Upgrade " + guy.gets("name") + " " + weapon_name
	let arg = yeCreateArray()
	arg.setAt(0, guy)
	arg.setAt(1, txt)
	mk_button2(wid, "upgrade-weapon", txt,
		  150, 250, "100 100 100", upgrade_guy_weapon, arg)
    }

    let stats = guy.get("stats")


    let wid_pix = yeGet(wid, "wid-pix");
    let ux = wid.get("country_ux")
    let text = "weapon: " + weapon_name + "\nstats:\n" +
	"Strength: " + stats.geti("strength") + "\n" +
	"Charm: " + stats.geti("charm") + "\n" +
	"Agility: " + stats.geti("agility") + "\n" +
	"Smart: " + stats.geti("smart") + "\n"
    square_txt(wid, ux, 450, 245, "150 150 150 180", text, ywRectW(wid_pix) / 2 - 80, 300)


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

    square_txt(wid, ux, 90, 58, "150 150 150 180", "Squad", ywRectW(wid_pix) - 160, 500)

    mk_button(wid, ux, main_buttons, "Move", 150, ywRectH(wid_pix) - 80,
	      "100 200 100", move_to)
    let guys = s.get("guys")
    let y_g = 90
    let x_g =  110
    let i = 0
    for (let g of guys) {
	let txt = g.gets("name") + "\n"
	txt += "PV: " + g.geti("life") + " / " + g.geti("max_life")
	square_txt(wid, ux, x_g, y_g, "100 100 100", txt)
	mk_button(wid, ux, main_buttons, txt, x_g, y_g, "100 100 100", select_guy, g)
	x_g += 300
	++i
	if (i == 3) {
	    x_g = 110
	    y_g = 160
	}
    }
}
