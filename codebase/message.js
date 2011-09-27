(function(){
	if(!window.dhtmlx)
		window.dhtmlx = {};

	function modality(mode){
		if(!modality.cover){
			modality.cover = document.createElement("DIV");
			modality.cover.className = "dhx_modal_cover";
			document.body.appendChild(modality.cover);
		}
		modality.cover.style.display = mode?"inline-block":"none";
	}

	function button(text, callback){
		return "<span class='dhtmlx_popup_button' "+(callback?"result='true' ":"")+">"+text+"</span>";
	}

	function info(text){
		if (!t.area){
			t.area = document.createElement("DIV");
			t.area.className = "dhtmlx_message_area";
			t.area.style[t.defPosition]="5px";
			document.body.appendChild(t.area);
		}

		t.hide(text.id);
		var message = document.createElement("DIV");
		message.innerHTML = text.text;
		message.className = "dhtmlx-info dhtmlx-" + text.type;

		if (t.defPosition == "bottom" && t.area.firstChild)
			t.area.insertBefore(message,t.area.firstChild);
		else
			t.area.appendChild(message);

		t.timers[text.id]=window.setTimeout(function(){
			t.hide(text.id);
		}, text.lifetime);

		t.pull[text.id] = message;

		return text.id;
	}

	function _createBox(config, ok, cancel){
		var box = document.createElement("DIV");
		box.className = " dhtmlx_modal_box dhtmlx-"+config.type;

		var inner = '<div class="dhtmlx_popup_title">'+config.title+'</div><div class="dhtmlx_popup_text"><span>'+config.text+'</span></div><div  class="dhtmlx_popup_controls">';
		if (ok)
			inner += button(config.ok || "Ok", true);
		if (cancel)
			inner += button(config.cancel || "Cancel", false);
		inner += '</div>';
		box.innerHTML = inner;

		box.onclick = function(e){
			e = e ||event;
			var source = e.target || e.srcElement;
			if (source.className == "dhtmlx_popup_button"){
				if (config.callback)
					config.callback.call(window, source.getAttribute("result") == "true");
				modality(false);
				box.parentNode.removeChild(box);
				box = null;
			}
		};

		modality(true);
		document.body.appendChild(box);
		var x = Math.abs(Math.floor((document.body.clientWidth - box.offsetWidth)/2));
		var y = Math.abs(Math.floor((document.body.clientHeight - box.offsetHeight)/2));
		box.style.top = y+'px';
		box.style.left = x+'px';
	}

	function _popupButtonClick(config, param){
		return function(){
			t.hide(config.id);
			if(typeof config.callback == "function")
				config.callback(param);
		};
	}
	function alertPopup(config){
		config.title = config.title || "Alert";
		var box = _createBox(config, true, false);
	}
	function confirmPopup(config){
		config.title = config.title || "Confirm";
		var box = _createBox(config, true, true);
	}
	function box_params(text, type, callback){
		if (typeof text != "object"){
			if (typeof type == "function"){
				callback = type;
				type = "";
			}
			text = {text:text, type:type, callback:callback };
		}
		return text;
	}
	function params(text, type, lifetime, id){
		if (typeof text != "object")
			text = {text:text, type:type, lifetime:lifetime, id:id};
		text.id = text.id||t.uid();
		text.lifetime = text.lifetime||t.defTimeout;
		return text;
	}
	dhtmlx.alert = function(){
		text = box_params.apply(this, arguments);
		text.type = text.type || "confirm";

		alertPopup(text);
	};
	dhtmlx.confirm = function(){
		text = box_params.apply(this, arguments);
		text.type = text.type || "alert";
		confirmPopup(text);
	};
	var t = dhtmlx.message = function(text, type, lifetime, id){
		text = params.apply(this, arguments);
		text.type = text.type||"info";

		var subtype = text.type.split("-")[0];
		switch (subtype){
			case "alert":
				return alertPopup(text);
			break;
			case "confirm":
				return confirmPopup(text);
			break;
			default:
				return info(text);
			break;
		}
	};

	t.seed = (new Date()).valueOf();
	t.uid = function(){return t.seed++;};
	t.defTimeout = 5000;
	t.defPosition = "top";
	t.pull = {};
	t.timers = {};

	t.hideAll = function(){
		for (var key in t.pull)
			t.hide(key);
	};
	t.hide = function(id){
		var obj = t.pull[id];
		if (obj && obj.parentNode){
			window.setTimeout(function(){
				obj.parentNode.removeChild(obj);
				obj = null;
			},2000);
			obj.className+=" hidden";
			
			if(t.timers[id])
				window.clearTimeout(t.timers[id]);
			delete t.pull[id];
		}
	};
})();