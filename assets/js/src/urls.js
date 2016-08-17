//
// Setup tools for playing with routes and URL params
//
var router = new Rlite();

function processHash() {
	var hash = location.hash || '#!/';
	router.run(hash.substr(2));
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


//
// Stuff to do depending on what the URL is
//
router.add('', function(context){ // homepage
	views.show({
		template : 'main-template',
		events : {
			// "renderNavigation"    : renderNavigation(),
			"complete"               : main_onComplete,
			"toggle_post_popover"    : toggle_post_popover,
			"choosePhotos1"          : choosePhotos1,
			"voteForPoll"            : voteForPoll,
			"likePost"               : likePost,
			"focusCommentBox"        : focusCommentBox,
			"toggleCommentPopover"   : toggleCommentPopover,
			"showPostBtn"            : showPostBtn,
			"postComment"            : postComment,
			"addInterested"          : addInterested
		},
		header : {
			title: views.data.group.name,
			isRoot: false,
			buttons: [
				{ label: "Actions", icon: "ellipsis-h", fn: function(){ test_toast(); } }
			]
		},
		observe: {
			'uploadedPhotos': processUploadedPhotos
		}

	});

});

// ROUTE: mugInfo (about)
router.add('about', function(context){
	// console.log(context);

	function show_tab($ul, $li){
		$($ul.data('tab-selectors')).hide();
		$('#'+$li.data('show')).show();
		$ul.find('.tabs-tab').removeClass('tabs-tab--selected');
		$li.addClass('tabs-tab--selected');
	}

	show_tab($('.tabs'), $('.tabs-tab[data-show="mugInfo"]'));

	// views.modal_show({
	// 	template: "about",
	// 	modalType: 'fixed',
	// 	events: {
	// 	},
	// 	header : {
	// 		title: "About",
	// 		subtitle: views.data.group.name,
	// 		buttons: [
	// 			//{ label: "Post", fn: post_text }
	// 		]
	// 	},
	// 	// observe: {
	// 	// 	'uploadedPhotos': processUploadedPhotos2
	// 	// }
	// });
});

// ROUTE: Text post
router.add('create-new-post', function(context){
	views.modal_show({
		template: "postBox",
		events: {
			"post_text": post_text,
			"choosePhotos2": choosePhotos2,
			"complete": linkPosting
			// "expand_summary": expand_summary,
			// "toggleCommentPopover": toggleCommentPopover
		},
		header : {
			title: "Post something",
			//subtitle: views.data.group.name,
			buttons: [
				//{ label: "Post", fn: post_text }
			]
		},
		// observe: {
		// 	'uploadedPhotos': processUploadedPhotos2
		// }
	});
});

// ROUTE: Photo post
router.add('create-photo-post', function(context){
	var modalType = views.data.uploadedPhotos.length > 1 || views.data.previewPhotos.length > 1 ? 'large' : 'snap';

	views.modal_show({
		template: "photoPost",
		modalType: modalType,
		events: {
			"post_photo": post_photo,
			// "choose_recent_mup": choose_recent_mup,
			// "toggle_tag_overlay": toggle_tag_overlay,
			// "save_tags": save_tags,
			// "cancel_tags": cancel_tags,
			// "expand_summary": expand_summary
		},
		header : {
			title: "Photos",
			//subtitle: views.data.group.name,
			buttons: [
				//{ label: "Post", fn: post_photo }
			]
		}
	});

	views.data.uploadedPhotos = "";

});


// ROUTE: Poll post
router.add('create-poll-post', function(context){
	views.modal_show({
		template: "pollPost",
		events: {
			"post_poll": post_poll,
			// "expand_summary": expand_summary,
			"addPollOption": function(){
				$('<div class="group"><input type="text" class="choice" /></div>').appendTo('#pollOptions').find('input').focus();
			}
		},
		header : {
			title: "Poll",
			//subtitle: views.data.group.name,
			buttons: [
				{ label: "Post", fn: post_poll }
			]
		}
	});
});

// ROUTE: Spark MUP
router.add('spark-meetup', function(context){
	views.modal_show({
		template: "sparkMeetup",
		events: {
			"toggleDatePopover" : toggleDatePopover,
			"toggleTimePopover" : toggleTimePopover,
			"sparkedEventDate" : sparkedEventDate,
			"pickSpecificDate" : pickSpecificDate,
			"pickSpecificTime" : pickSpecificTime,
			"pickGeneralTime" : pickGeneralTime,
			"postSparkedMeetup" : postSparkedMeetup,
			"populateSparkedMup" : populateSparkedMup
		},
		header : {
			title: "Spark a Meetup",
			// buttons: [
			// 	{ label: "Post", fn: spark_meetup }
			// ]
		}
	});

	// uncomment this to make the calendar work
	// var cal = new Calendar( $('#calendar'), views.data.events_long );

});

// ROUTE: pre-mup page
router.add('preMup/:i', function(context){ // homepage
	var preMUPsArr = views.data.preMUPs;

	for(var i = 0; i < preMUPsArr.length; i++) {
		if (preMUPsArr[i].id == context.params.i) {
			views.data.preMUPRendered = preMUPsArr[i];
			break;
		}
	}

	views.show({
		template : 'preMup-template',
		events : {
			"complete"      : toggleInviteStripe,
			"addInterested" : addInterested,
			"userInvited"   : userInvited,
			"showPostBtn"   : showPostBtn,
			"post_text"     : post_text,
			"postComment"   : postComment
		},
		header : {
			title: views.data.group.name,
			isRoot: false,
			goHome: true,
			buttons: [
				{ label: "Actions", icon: "ellipsis-h", fn: function(){ alert('tapped overflow'); } }
			]
		}
	});

});

// ROUTE: Album grid
router.add('albums', function(context){

	views.show({
		template : 'albums',
		events : {
			"complete" : main_onComplete
		},
		header : {
			hidden: true
		}
	});

});

// ROUTE: All photos
router.add('groupPhotos', function(context){

	views.show({
		template : 'groupPhotos',
		events : {
			"complete" : main_onComplete
		},
		header : {
			hidden: true
		}
	});

});

// ROUTE: Photo grid (by album)
router.add('albums/:i', function(context){

	gimme.get([
		{"gimme": "album_photos", "data": {"page": 20, "photo_album_id": context.params.i}},
		{"gimme": "photo_album_meta", "data": {"photo_album_id": context.params.i, "urlkey": views.data.group.urlname }}
	], true).then(function(data){
		views.data.album_photos = data.album_photos;
		views.data.photo_album_meta = data.photo_album_meta;
	}).then(function(){
		views.show({
			template : 'albumPhotos',
			events : {
				"complete" : main_onComplete
			},
			header : {
				hidden: true
			}
		});
	});

});

// ROUTE: Photo detail screen
router.add('photo-detail/:i', function(context){
	var groupId = views.data.group.id;
	views.data.displayed_photo = {};

	gimme.get([
		{"gimme": "photo", "key": "photo_detail", "data": {"page": 1, "photo_id": context.params.i}, children: [
			{"gimme": "photo_albums", "key":"album_data" ,"data": {"page": 1}, "match": [["photo_album.photo_album_id", "photo_album_id"], ["photo_album.group_id", "group_id"]]},
			{"gimme": "event", "key":"event_data" ,"data": {"page": 1}, "match": [["photo_album.event_id", "event_id"]]}
		]}
	], true).then(function(data){
		console.log(data);
		views.data.displayed_photo = data.photo_detail[0];
		views.data.displayed_photo.album_data = views.data.displayed_photo.album_data[0];
		views.data.displayed_photo.event_data = views.data.displayed_photo.event_data[0];
	}).then(function(){

		// TODO: handle this logic elsewhere
		// update the data for the media view based on the above call
		views._media.header_data.title = views.data.displayed_photo.album_data.title;

		console.log(views._media);

	});

	views.media_show({
		template: "photoDetail",
		events: {
			"keyboard_photo_nav": keyboard_photo_nav()
		},
		header : {
			title: 'Meetup album', // gets updated after the data is pulled
			subtitle: views.data.group.name,
			subtitleLink: views.data.group.link,
			buttons: [
			// { label: "Share", icon: "share-square-o", fn: toggle_photoDetail_share_popover},
			// 	{ label: "More", icon: "ellipsis-h", fn: toggle_photoDetail_popover }
			]
		}
	});

});

// ROUTE: Member list
router.add('members', function(){
	views.show({
		template : 'members',
		events : {
			"complete" : main_onComplete
		},
		header : {
			hidden: true
		}
	});
});
