enyo.kind({
	// --------- Taskr Information ----------
	name: "Taskr",
	kind: enyo.VFlexBox,
	style: "background: #FFF;",
	
	// ======================================== CONTENT ======================================== //
	components: [
		// ---------- DB SERVICE ----------
		{   kind: "DbService", dbKind: "com.omastudios.taskr:1", onFailure: "dbFailure",
			components: [
				{   name: "createKind", method: "putKind", onSuccess: "dbPutKindSuccess" },
				{	name: "removeKind", method: "delKind", onSuccess: "dbDelKindSuccess" },
				{   name: "getDbTasks", method: "find",    onSuccess: "dbGetSuccess" },
				{   name: "putDbTasks", method: "put",     onSuccess: "dbPutSuccess" },
				{   name: "delDbTasks", method: "del",     onSuccess: "dbDelSuccess" }
			] 
		},
		// ---------- HEADER ----------
		{kind: "Toolbar", layoutKind: "HFlexLayout", width: "100%", height:"50px", components: [
			{kind: "ToolButtonGroup", components: [
				{   name: "clearButton", kind: "PickerButton", className: "White", 
					caption: "Clear Completed", onclick: "clearCompletedClick" 
				}
			]},
			{   name: "filterPriority", kind: "Picker", className: "White", /*flex: 1,*/  onChange: "filterPriorityChange",
				value: "all", items: [
					{ caption: "Priority: All",      value: "all" },
					{ caption: "Priority: High",     value: "high" },
					{ caption: "Priority: Medium",   value: "medium" },
					{ caption: "Priority: Low",      value: "low" }
			]},
			{flex: 1},
			{ name: "tasksTotal", kind: enyo.VFlexBox, content: "Total: 0", className: "TotalText" },
			{flex: 1},
			{ name: "tasksCompleted", kind: enyo.VFlexBox, content: "Completed: 0", className: "TotalText" },
			{ flex: 1 },
			{ content: "TASKR", className: "Title", onclick: "aboutClick" }
		]},
		// ---------- CENTER ----------
		{   kind: enyo.HFlexBox, style: "background:#FFF;", flex: 1,
			components: [
				{   name: "taskList", kind: "VirtualList", onSetupRow: "taskListSetupRow", flex: 1,
					components: [
						{   kind: "SwipeableItem", height: "auto", layoutKind: "HFlexLayout", 
							onclick: "taskListClickRow", onConfirm: "taskListSwipe",
							className: "enyo-swipeableitem", confirmRequired: false,
							components: [
								//List item text
								{ kind: enyo.VFlexBox, flex: 1, components: [ 
									{ name: "taskItemText", style: "padding:8px;font-size:22px;" },
									{ kind: enyo.HFlexBox, style: "padding:8px;font-size:16px;", components: [
										{   content: "Priority:  ", flex: 1, 
											style: "text-align:right;padding-right:6px;font-weight:bold;" },
										{ name: "taskItemPriority", flex: 1 }
									]}
								]},
								//List item tick button
								{   name: "taskItemIcon", kind: "Image", src: "images/box_empty_64.png", style: "margin:auto" }
							]
						}
					]
				}
			]
		},
		// ---------- FOOTER ----------
		{   kind: "Toolbar", layoutKind: "HFlexLayout", height: "50px",
			components: [
			
				//Task text input
				{   name: "taskInput",  kind: "Input", flex: 1, inputClassName: "White", focusClassName: this.focusClassName + "Black" },
				//Priority Selector
				{ kind: "VFlexBox", content: "Priority: ", className: "TotalText" },
				{   name: "taskPriority", kind: "Picker", className: "White",
					value: "medium", items: [
						{ caption: "High", value: "high" },
						{ caption: "Medium", value: "medium" },
						{ caption: "Low", value: "low" }
				]},
				//Submit button
				{   name: "taskSubmit", kind: "Button", label: "Submit Task", onclick: "taskSubmitClick" }
			]
		},
		
		//ABOUT
		{ name: "aboutPopup", kind: "Popup", width: "50%", 
			components:[
				{   content: "Taskr is a task list application availably exclusively for HP TouchPad. " +
					"It's my first application built using the enyo framework and it is absolutely free.",
					style: "margin:8px;font-size:14px;"
				},
				{   content: "Copyright &copy; Jack Newcombe 2011", style: "margin:16px 8px;font-size:16px;text-align:center;" },
				{   kind: "Button", label: "Support (Email)", onclick: "emailAboutClick" },
				{	kind: "Button", label: "Support (Forum)", onclick: "forumAboutClick" },
				{   kind: "Button", label: "Icons (www.icons-land.com)", onclick: "iconsAboutClick" },
				{   kind: "Button", label: "Close", onclick: "closeAboutClick" }
			]
		}
	],
	//About click methods
	closeAboutClick: function(){this.$.aboutPopup.close(); },
	emailAboutClick: function(){window.location = "mailto:support@oma-studios.co.uk"; },
	forumAboutClick: function(){window.location = "http://jnewc.net/support"; },
	iconsAboutClick: function(){window.location = "http://www.icons-land.com"; },
	
	// ======================================== EVENTS ======================================== //
	// ---------- LIST EVENTS ---------- //
	taskListSetupRow: function(inSender, inIndex) { //list init
		this.log("inIndex: " + inIndex);
		
		var pri = this.$.filterPriority.getValue();
		var c = 0;
		//If not all, then filter
		if(pri !== "all") {
			for(var i = 0; i < this.taskList.length; i++) {
				//If we've found a matching priority
				var d = this.taskList[i];
				if(d) {
					if(d.name.taskPriority === pri) {
						//If we're at the right priority-filtered row
						if(c === inIndex) {
							this.$.taskItemText.setContent(d.name.taskText);
							this.$.taskItemPriority.setContent(d.name.taskPriority);
							this.$.taskItemPriority.setStyle("color: " + this.getPriorityColor(d.name.taskPriority));
							if(d.name.state === 1) {
								this.$.taskItemIcon.setSrc("images/box_ticked_64.png");
							} else if(d.name.state === 0) {
								this.$.taskItemIcon.setSrc("images/box_empty_64.png");
							}
							return true; //IMPORTANT !!!
						} else {
							c++;
						}
					}
				}
			} 
		} 
		//No filter
		else {
			var dd = this.taskList[inIndex];
			if(dd) {
				this.$.taskItemText.setContent(dd.name.taskText);
				this.$.taskItemPriority.setContent(dd.name.taskPriority);
				this.$.taskItemPriority.setStyle("color: " + this.getPriorityColor(dd.name.taskPriority));
				if(dd.name.state === 1) {
					this.$.taskItemIcon.setSrc("images/box_ticked_64.png");
				} else if(dd.name.state === 0) {
					this.$.taskItemIcon.setSrc("images/box_empty_64.png");
				}
				return true; //IMPORTANT !!!
			}
		}
	},
	taskListClickRow: function(inSender, inEvent) {
		var priority = this.$.filterPriority.getValue();
		var t;
		if(priority !== "all") {
			var c = 0;
			for(i = 0; i < this.taskList.length; i++) {
				var tempd = this.taskList[i];
				if(tempd.name.taskPriority === priority) {
					//If this is the priority-filtered index.
					if(c === inEvent.rowIndex) {	t = this.taskList[i]; break; } 
					else { c++; }
				}
			}
		} 
		//Usual
		else {
			t = this.taskList[inEvent.rowIndex];
		}
		
		if(t.name.state === 1) {
			this.$.taskItemIcon.setSrc("images/box_empty_64.png");
			t.name.state = 0;
		}
		else if(t.name.state === 0) {
			this.$.taskItemIcon.setSrc("images/box_ticked_64.png");
			t.name.state = 1;
		}
		this.$.putDbTasks.call({objects: [t]});
	},
	taskListSwipe: function(inSender, inIndex) {
		var priority = this.$.filterPriority.getValue();
		var t;
		if(priority !== "all") {
			var c = 0;
			for(i = 0; i < this.taskList.length; i++) {
				var tempd = this.taskList[i];
				if(tempd.name.taskPriority === priority) {
					//If this is the priority-filtered index.
					if(c === inIndex) {	t = this.taskList[i]; break; } 
					else { c++; }
				}
			}
		}
		else {
			t = this.taskList[inIndex];
		}
		this.$.delDbTasks.call({ids: [t._id], purge: true});
	},
	// ---------- BUTTON EVENTS ---------- //
	aboutClick: function() {
		this.$.aboutPopup.openAtCenter();
	},
	taskSubmitClick: function() {
		if(this.$.taskInput.getValue() == "") {
			this.log("Empty task - didn't add");
			return;
		}
		//Create and add new task.
		var task = {
			taskText: this.$.taskInput.getValue(),
			taskPriority: this.$.taskPriority.getValue(),
			state: 0
		};
		this.taskList.push(task);
		
		//Push list to db
		this.log(this.formatTask(task));
		this.$.putDbTasks.call({objects: [this.formatTask(task)] });
	},
	clearCompletedClick: function() {
		var ids = [];
		for(var i = 0; i < this.taskList.length; i++) {
			var t = this.taskList[i];
			if(t.name.state === 1) {
				ids.push(t._id);
			}
		}
		if(ids.length === 0) { return; }
	
		this.$.delDbTasks.call({ids: ids, purge: true});
	},
	// ---------- SELECTOR EVENTS ---------- //
	filterPriorityChange: function() {
		this.$.taskList.refresh();
	},
	// ======================================== DB CALLBACKS ======================================== //
	dbPutKindSuccess: function(inSender, inResponse, inRequest) {
		//Log kind creation
		this.log("DB KIND CREATED - SUCCESS");
		this.log(inSender);
		this.log(inResponse);
		//Next, get stored tasks.
		this.$.getDbTasks.call();
	},
	dbDelKindSuccess: function(inSender, inResponse, inRequest) {
		//Log kind deletion
		this.log("DB KIND DELETED - SUCCESS");
		this.log(inSender);
		this.log(inResponse);
		//Callback chain...
		this.$.createKind.call({owner:"com.omastudios.taskr"});
	},
	dbFailure: function(inSender, inResponse, inRequest) {
		this.log("DB ERROR - FAILURE");
		this.log(inSender);
		this.log(inResponse);
	},
	dbGetSuccess: function(inSender, inResponse, inRequest) {
		this.log("DB GET - SUCCESS");
		this.log(inSender);
		this.log(inResponse);	
		
		this.taskList = inResponse.results; //The task list array is contained here.
		this.$.taskList.refresh();
		this.setStats();
		
		this.log("class: " + this.$.clearButton.className);
	},
	dbPutSuccess: function(inSender, inResponse, inRequest) {
		this.log("DB PUT - SUCCESS");
		this.log(inSender);
		this.log(inResponse);	
		
		this.$.taskInput.setValue("");
		//Refresh list to show new task.
		this.$.getDbTasks.call();
	},
	dbDelSuccess: function(inSender, inResponse, inRequest) {
		this.log("DB DEL - SUCCESS");
		this.log(inSender);
		this.log(inResponse);	
		
		//Refresh list to show new task.
	
		this.$.getDbTasks.call();
	},
	// ======================================== HELPER METHODS ======================================== //
	getPriorityColor: function(txt) {
		if(txt == "low") {
			return "darkgreen";
		}
		else if(txt == "medium") {
			return "darkblue";
		}
		else if(txt == "high") {
			return "darkred";
		}
		return "black";
	},
	setStats: function() {
		var total = this.taskList.length;
		var completed = 0;
		for(var i = 0; i < this.taskList.length; i++) {
			if(this.taskList[i].name.state == 1) {
				completed++;
			}
		}
		this.$.tasksTotal.setContent("Total: " + total);
		this.$.tasksCompleted.setContent("Completed: " + completed);
	},
	formatTask: function(t) {
		return { _kind: this.$.dbService.dbKind, name: t };
	},
	countPriority: function() {
		var pri = this.$.filterPriority.getValue();
		var c = 0;
		for(var i = 0; i < this.taskList.length; i++) {
			if(this.taskList[i].name.taskPriority === pri) {
				c++;
			}
		}
		return c;
	},
	
	// ---------- Constructor CREATE ----------
	create: function() {
		this.inherited(arguments); //IMPORTANT !!! KEEP AT TOP !!!
		//Start DB callback chain..
		this.$.createKind.call({owner:"com.omastudios.taskr"});
		
		
	}
});
