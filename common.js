// JavaScript Document
var windowsOpened = 0;
var windowStack = new Array();

function showWindow(id) {
	if (windowStack.length == 0) {
		$(".fadeBlack").fadeIn(200);
	}
	
	if (windowStack.length > 0) {
		$(windowStack[windowStack.length - 1]).fadeOut(200);
	}

	$(id).slideDown(200);	
	
	windowStack.push(id);

	windowsOpened++;
	console.log(windowStack);
}

function hideWindow(totalWindows) {
	if (windowsOpened > 0) {
		windowsOpened--;
	}
		
	if (windowStack.length > 0) {
		$(windowStack[windowStack.length - 1]).fadeOut(200);
	}
	
	if (totalWindows == undefined) {
		totalWindows = 1;
	}
	
	if (windowStack.length == 1) {
		windowStack.pop();
	} else if (totalWindows > 0) {
		windowStack.splice(windowStack.length - totalWindows, windowStack.length);
	}
	
	if (windowStack.length > 0) {
		$(windowStack[windowStack.length - 1]).slideDown(200);			
	} if (windowStack.length == 0) {
		$(".fadeBlack").fadeOut(200);
	}
	
	console.log(windowStack);
}
