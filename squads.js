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
	    if (yuiRand() & 1) {
		w = weapons.get("iron longsword")
	    } else {
		w = weapons.get("iron spear")
	    }
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
    for (g of squad.get("guys")) {
	if (g.geti("life") > 0) {
	    return false;
	}
    }
    return true;
}
