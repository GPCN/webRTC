var resizerSize = 10;
var chatWidth = 346;
var videoMargin = 10;

function getRoomBtn(event)
{
	console.log("Create Room");
	//
	var x = $(".holder.create").css("left") + 1;
	console.log(x);
	$(".holder.create").css("left", 200);
	$(".holder.create").animate({left:"-1000px", display:"none", opacity: "0.1"}, 1000, function(){$(".holder.create").css("display", "none");});
	$(".holder.share").css("display", "block");
	$(".holder.share").css("left", 1000);
	$(".holder.share").animate({left:"200px", display:"none", opacity: "1"}, 1000);
}

function getBackBtn(event)
{
	$(".holder.share").animate({left:"1000px", display:"none", opacity: "0.1"}, 1000, function(){$(".holder.share").css("display", "none");});
	$(".holder.create").css("display", "block");
	$(".holder.create").animate({left:"200px", display:"none", opacity: "1"}, 1000);
}

function getCreateRoomBtn()
{
	var text = $(".name-text.yourRoomName").val();
	//
	console.log(text);
	if (text)
	{
		window.location = window.location.href.split('?')[0] + "?room=" + text;
	}
}

window.onload = function()
{
	draggable('chatResizer');
	$("#chatResizer").dblclick(function(){
		// check neu dang mo
		if ($("#chatResizer").attr("collapse"))
		{
			var x = 350;
			$("#chatWrapper").css("left", window.screen.availWidth - x - resizerSize);
			$("#chatWrapper").css("width", x + resizerSize);
			$("#chatInnerWrapper").css("width", x);
			$("#videos").css("width", window.screen.availWidth - x - resizerSize);
			$("#chatResizer").removeAttr("collapse");
			$("#sendBtn").show();
		}
		else
		{
			var x = 0;
			$("#chatWrapper").css("left", window.screen.availWidth - x - resizerSize);
			$("#chatWrapper").css("width", x + resizerSize);
			$("#chatInnerWrapper").css("width", x);
			$("#videos").css("width", window.screen.availWidth - x - resizerSize);
			$("#chatResizer").attr("collapse", true);
			$("#sendBtn").hide();
		}
	});
	//
	$(".name-text.yourRoomName").keypress(function(event){
		if (event.keyCode != 13) return;
		//
		getCreateRoomBtn();
	});
	
	$("#inputMessage").keypress(function(event){
		if (event.keyCode != 13) return;
		if (event.shiftKey == true) return true;
		if ($("#inputMessage").val() == "") 
		{
			$("#inputMessage").val("");
			return;
		}
		//
		addMessage($("#inputMessage").val(), avatar);
		peerManager.sendMessage(JSON.stringify({type: "message", content: $("#inputMessage").val()}), null);
		//
		$("#inputMessage").val("");
		return false;
	});
	
	$("#sendBtn").click(function()
	{
		addMessage($("#inputMessage").val(), avatar);
		$("#inputMessage").val("");
	});
	
	$("#addVideoBtn1").click(function()
	{
		console.log("Add Video");
		addVideo(null, null);
	});
	
	$("#videos").resize(function()
	{
		console.log("Resize");
		arrangeVideo();
	});

	starty();
}

$(document).ready(function()
{
	console.log("ready");
	
	var roomName = getURLParameter("room");
	if (roomName)
	{
		$("#main").hide();
		$("#footer").hide();
		//
		$("#videos").css("width", window.screen.availWidth - 350);
	}
	else
	{
		$("#videos").hide();
		$("#chatWrapper").hide();
	}
});


var dragObj = null;

function draggable(id)
{
    var obj = document.getElementById(id);
    obj.onmousedown = function(){
            dragObj = this;
    }
}

document.onmouseup = function(e){
    dragObj = null;
};

document.onmousemove = function(e){
    var x = e.clientX;
    var y = e.clientY;
	
    if(dragObj == null)
        return;
	
	if (window.innerWidth - x < 210) 
	{
		if ($("#chatResizer").attr("collapse"))
		{
			var x = 200;
			chatWidth = 200;
			$("#chatWrapper").css("left", window.innerWidth - x - resizerSize);
			$("#chatWrapper").css("width", x + resizerSize);
			$("#chatInnerWrapper").css("width", x);
			$("#videos").css("width", window.innerWidth - x - resizerSize);
			$("#chatResizer").removeAttr("collapse");
			$("#sendBtn").show();
		}
		return;
	}
	
	if (window.innerWidth - x > 500) return; 
	
	chatWidth = window.innerWidth - x;
    $("#chatWrapper").css("left", x);
	$("#chatWrapper").css("width", window.innerWidth - x);
	$("#chatInnerWrapper").css("width", window.innerWidth - x - resizerSize);
	$("#videos").css("width", x);
    //dragObj.style.top= y +"px";
};

var abcde;
function addMessage(message, avt, id)
{
	var temp = document.createElement("div");
	var avatar_ = document.createElement("div");
	var text = document.createElement("div");
	var content = document.createTextNode(message);
	var break_ = document.createElement("br");
	var t = document.createTextNode(id);
	//
	temp.appendChild(avatar_);
	temp.appendChild(text);
	temp.appendChild(break_);
	//
	if (avt) avatar_.appendChild(avt.cloneNode(false));
	else avatar_.appendChild(t);
	//
	if (avt == avatar)
	{
		temp.style.background = "rgba(0, 0, 0, 0.21)";
	}
	
	message = message.replace(/\n/g, "<br/>");
	text.innerHTML = message;
	avatar_.style.float = "left";
	avatar_.maxHeight = "50px";
	text.style.marginLeft = "80px";
	text.style.paddingTop = "10px";
	text.style.maxWidth = "100%";
	text.style.wordBreak = "break-all";
	temp.style.height = "inherit";
	temp.setAttribute("class", "form-control");
	temp.style.margin = "5px 0";
	temp.style.padding = "inherit";
	//
	$("#messageWrapper").append(temp);
	$("#messageWrapper")[0].scrollTop = $("#messageWrapper")[0].scrollHeight;
}

// Process Video
function addVideo(stream, id)
{
	// console.log("Stream", stream);
	// create a div element
	var temp = document.createElement("div");
	var tempVideo = document.createElement("video");
	var tempBar = document.createElement("div");
	var muteButton = document.createElement("button");
	muteButton.setAttribute("class", "BarButton");
	tempBar.appendChild(muteButton);
	muteButton.innerHTML = '<i class="icon fa fa-microphone"></i>';
	$(muteButton).click(function()
	{
		var v = $("video", this.parentNode.parentNode);
		//console.log(v);
		if (!v.prop('muted'))
		{
			v.prop('muted', true);
			$(this).attr("class", "BarButton ActiveButton");
		}
		else
		{
			v.prop('muted', false);
			$(this).attr("class", "BarButton");
		}
	});
	//
	if (id == null)
	{
		temp.id = channel.userid;
		temp.setAttribute("type", "local");
		temp.setAttribute("class", "LocalVideoContainer VideoContainer");
		tempVideo.setAttribute("class", "LocalVideo Video");
		//tempVideo.setAttribute("muted","");
		tempBar.setAttribute("class", "LocalBar");
		$(tempVideo).on('play', function (e) {
			avatar = CaptureImage();
			$(this).attr("played", true);
			arrangeVideo();
			//
			if ($(this).prop('muted'))
			{
				$(muteButton).attr("class", "BarButton ActiveButton");
			}
			else
			{
				$(muteButton).attr("class", "BarButton");
			}
		});
		// <i class="fa fa-smile-o"></i>
		var avatarButton = document.createElement("button");
		avatarButton.setAttribute("class", "BarButton");
		avatarButton.innerHTML = '<i class="icon fa fa-smile-o"></i>';
		tempBar.appendChild(avatarButton);
		//
		$(avatarButton).click(function(){
			//
			//console.log("avatar === ");
			//
			avatar = CaptureImage();
			peerManager.sendMessage(JSON.stringify({type: "avatar", content: avatar.src}), null);
			//
			addMessage("[New Avatar]",avatar);
		});
	}
	else
	{
		temp.id = id;
		temp.setAttribute("type", "remote");
		temp.setAttribute("class", "RemoteVideoContainer VideoContainer");
		tempVideo.setAttribute("class", "RemoteVideo Video");
		//tempVideo.setAttribute("muted","");
		tempBar.setAttribute("class", "LocalBar");
		$(tempVideo).on('play', function (e) {
			$(this).attr("played", true);
			arrangeVideo();
			//
			if ($(this).prop('muted'))
			{
				$(muteButton).attr("class", "BarButton ActiveButton");
			}
			else
			{
				$(muteButton).attr("class", "BarButton");
			}
		});
	}
	
	// toolbar
	temp.style.opacity = "0";
	temp.style.width = "auto";
	temp.style.height = "auto";
	temp.appendChild(tempVideo);
	temp.appendChild(tempBar);
	$(temp).hover(hoverVideoIn, hoverVideoOut);
	
	// setVideo
	tempVideo.src = URL.createObjectURL(stream);
	tempVideo.autoplay = true;
	//
	videosContainer.appendChild(temp);
}

function hoverVideoIn()
{
	//console.log("hover in", this);
}

function hoverVideoOut()
{
	//console.log("hover out", this);
}

function arrangeVideo1(element, top, left, width, height)
{
	var videoRatio = $("video", element).width() / $("video", element).height();
	var frameRatio = width/height;
	//
	if (!$("video", element).attr("played")) return;
	//
	var t,l,w,h;
	//
	if (videoRatio > frameRatio)
	{
		w = width - videoMargin * 2;
		h = w / videoRatio;
		l = left + videoMargin;
		t = top + ((height - h) / 2);
	}
	else
	{
		h = height - videoMargin * 2;
		w = h * videoRatio;
		t = top + videoMargin;
		l = left + ((width - w) / 2);
	}
	//
	//console.log($(element).css("opacity"));
	if ($(element).css("opacity") == 0)
	{
		$(element).css("left", l);
		$(element).css("top", t);
		$(element).css("height", h);
		$(element).css("width", w);
		$(element).animate({opacity: "1"}, 500);
	}
	else $(element).animate({left: l + "px", top: t + "px", height : h + "px", width : w + "px", opacity: "1"}, 500);
}

function arrangeVideo()
{
	//console.log("arrangeVideo");
	var videos = $(".VideoContainer");
	var count = videos.length;
	var h = $("#videos").height();
	var w = $("#videos").width();
	var top = $("#videos").offset().top;
	var left = $("#videos").offset().left;
	//
	resizeWindow();
	//
	if (count == 1)
	{
		//
		arrangeVideo1(videos[0], 0, 0, w, h);
	}
	else if (count == 2)
	{
		for (var i = 0; i < 2; ++i)
		{
			arrangeVideo1(videos[i], 0, w * i / 2, w / 2, h);
		}
	}
	else if (count <= 4)
	{
		for (var i = 0; i < 2; ++i)
		{
			for (var j = 0; j < 2; ++j)
			{
				if (i * 2 + j >= count) return;
				arrangeVideo1(videos[i * 2 + j], i * h / 2, j * w / 2, w / 2, h / 2);
			}
		}
	}
	else if (count <= 6)
	{
		for (var i = 0; i < 2; ++i)
		{
			for (var j = 0; j < 3; ++j)
			{
				if (i * 3 + j >= count) return;
				arrangeVideo1(videos[i * 3 + j], i * h / 2, j * w / 3, w / 3, h / 2);
			}
		}
	}
	else if (count <= 9)
	{
		for (var i = 0; i < 3; ++i)
		{
			for (var j = 0; j < 3; ++j)
			{
				if (i * 3 + j >= count) return;
				arrangeVideo1(videos[i * 3 + j], i * h / 3, j * w / 3, w / 3, h / 3);
			}
		}
	}
	else if (count <= 16)
	{
		for (var i = 0; i < 4; ++i)
		{
			for (var j = 0; j < 4; ++j)
			{
				if (i * 4 + j >= count) return;
				arrangeVideo1(videos[i * 4 + j], i * h / 4, j * w / 4, w / 4, h / 4);
			}
		}
	}
}

var divH = divW = 0;
var shortTime;

function checkSize()
{
	var h = $("#videos").height();
	var w = $("#videos").width();
	//
	var x = 0;
	
	if (h != divH || w != divW)
	{
		divH = h;
        divW = w;
		arrangeVideo();
		//
		//shortTime = setInterval(checkSize, 500);
	}
	else
	{
		clearInterval(shortTime);
	}
}

setInterval(checkSize, 500);


function resizeWindow()
{
	//
	if (window.innerWidth < 900)
	{
		//console.log("< 900");
		chatWidth = 40 * window.innerWidth / 100;
		if (chatWidth < 200) chatWidth = 200;
	}
	//
	var chatLeft = window.innerWidth - chatWidth;
	//
	$("#chatWrapper").css("left", chatLeft);
	$("#chatWrapper").css("width", window.innerWidth - chatLeft);
	$("#chatInnerWrapper").css("width", window.innerWidth - chatLeft - resizerSize);
	$("#videos").css("width", chatLeft);
};

$(window).resize(resizeWindow);