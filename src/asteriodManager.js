x = [];
y = [];

AsteriodManager.prototype.addEntity = function(startX,endX,startY,endY) {
	x.push({x:startX.x, asteriod:startX.asteriod, position:'start'});
	x.push({x:endX.x, asteriod:endX.asteriod, position:'end'});
	y.push({y:startY.y, asteriod:startY.asteriod, position:'start'});
	y.push({y:endY.y, asteriod:endY.asteriod, position:'end'});
}