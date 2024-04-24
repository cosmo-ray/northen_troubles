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

function draw_arrow(wid, cnt, x0, y0, x1, y1, color)
{
    print("draw arrow\n");
    cnt.push(ywCanvasNewLine(wid, x0, y0, x1, y1, color));

    /* chat gpt did the algorytm */
    var arrowSize = 10; // Size of the arrowhead

    // Calculate the direction of the segment
    var dx = x1 - x0;
    var dy = y1 - y0;
    var magnitude = Math.sqrt(dx * dx + dy * dy);
    var unitX = dx / magnitude;
    var unitY = dy / magnitude;

    // Draw the arrowhead
    cnt.push(ywCanvasNewLine(wid, x1, y1,
			     x1 - arrowSize * unitX - arrowSize * unitY,
			     y1 - arrowSize * unitY + arrowSize * unitX, color));
    cnt.push(ywCanvasNewLine(wid, x1, y1,
			     x1 - arrowSize * unitX + arrowSize * unitY,
			     y1 - arrowSize * unitY - arrowSize * unitX, color));
}
