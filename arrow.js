
function draw_arrow(wid, x0, y0, x1, y1, color)
{
    print("draw arrow\n");
    ywCanvasNewLine(wid, x0, y0, x1, y1, color);

    /* chat gpt did the algorytm */
    var arrowSize = 10; // Size of the arrowhead

    // Calculate the direction of the segment
    var dx = x1 - x0;
    var dy = y1 - y0;
    var magnitude = Math.sqrt(dx * dx + dy * dy);
    var unitX = dx / magnitude;
    var unitY = dy / magnitude;

    // Draw the arrowhead
    ywCanvasNewLine(wid, x1, y1,
		    x1 - arrowSize * unitX - arrowSize * unitY,
		    y1 - arrowSize * unitY + arrowSize * unitX, color);
    ywCanvasNewLine(wid, x1, y1,
		    x1 - arrowSize * unitX + arrowSize * unitY,
		    y1 - arrowSize * unitY - arrowSize * unitX, color);
}
