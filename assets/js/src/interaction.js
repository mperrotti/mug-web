/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
	DOCUMENT READY
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/
function main_onComplete() {
	console.log('DOM is ready');

	// this is weird, make it easier
	$('.js-fndTextTrunc').each(function() {
		var $el = $(this);
		ellipsis($el, 7, { wrapWith: '<p>', more: true, title: false }); // see js/src/foundation/foundationTextTrunc for this code
	});

	$(document.body).on('click', '[data-ellipsis-applied] [data-toggle-ellipsis]', function(e) { toggleEllipsis(e) });
}

/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
	GLOBAL NAVIGATION
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/
function renderNavigation() {
	if ($('.mainNav').length < 1) {
		views.nav_show({
			"loggedIn": false,
			"isModern": false
		});

		// Change to sticky nav
		
		setTimeout(function() { // using this to deal with weird Waypoints bug
			$('.mainNav').waypoint({
				handler: function(direction) {
					if (direction == 'up') {
						// over photo
						$(this).addClass('mainNav--photoOverlay inverted'); // change nav bg
						$(this).find('.button--bordered').addClass('button--contrast').removeClass('button--bordered'); // change button
						$(this).find('.js_logo--script').removeClass('display--none').addClass('display--inlineBlock'); // show script logo
						$(this).find('.js_logo--swarm').removeClass('display--inlineBlock').addClass('display--none'); // hide swarm logo
						$(this).find('.js_signUp').toggleClass('display--none');
						//console.log($(this).find('.js_signUp'));
					} else {
						// over content
						$(this).removeClass('mainNav--photoOverlay inverted');
						$(this).find('.button--contrast').addClass('button--bordered').removeClass('button--contrast');
						$(this).find('.js_logo--script').removeClass('display--inlineBlock').addClass('display--none'); // show script logo
						$(this).find('.js_logo--swarm').removeClass('display--none').addClass('display--inlineBlock'); // hide swarm logo
						$(this).find('.js_signUp').toggleClass('display--none');
					}
				},
				offset: function() {
					return -1 * $('.stripe-heroContent').height();
				}
			});
		}, 1);
		$('.mainNav').addClass('mainNav--sticky mainNav--photoOverlay inverted');
		
	}
}

/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
POST TO CONVERSATION
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/

//
// Open posting interface
//
function toggle_post_popover(event){
	var changeHash = function(){ window.location.hash = '#!/create-new-post'; return false; };
	// console.log(event);
	changeHash();
}

//
// Text post
//
function post_text(event){
	views.modal_hide();
	var newDiscussion = new Items.Discussion();

	newDiscussion.top_post = {
		member: {
			name: views.data.current_member.name,
			photo: {thumb: views.data.current_member.photo}
		},
		body: document.getElementById('post-textarea').value
	};

	console.log(newDiscussion);

	views.data.news.unshift( newDiscussion );
}

//
// Photo post
//
function choosePhotos1(event){
	$('#photoFileInput1').click();
	return false;
}
function choosePhotos2(event){
	$('#photoFileInput2').click();
	return false;
}
function choosePhotos3(event){
	$('#photoFileInput3').click();
	return false;
}

function processUploadedPhotos(){
	views.data.previewPhotos = [];
	var photos = views.data.uploadedPhotos;

	if(photos.length > 0 ){
		for(var i=0; i<photos.length; i++){
			var photo = photos[i];
				if (photos) {
					var reader = new FileReader();
					reader.onload = function (e) {
						views.data.previewPhotos.push(e.target.result);
					}
					reader.readAsDataURL(photo);
			}
		}
		window.location.hash = '#!/create-photo-post';
	}
}

function post_photo(event){
	views.modal_hide();
	var dropdown       = document.getElementById('recent-mup-list'),
			chosenAlbum    = dropdown.value !== 'none' ? dropdown.value : 'none',
			newPhotos;

	var getEvent = function(chosenAlbum){
		var album;

		for (var i = 0; i < views.data.events_short.length; i++) {
			var obj = views.data.events_short[i];

			for(var prop in obj) {
				if (obj.hasOwnProperty(prop) && obj[prop] == chosenAlbum) {
					album = obj;
				}
			}
		}

		return album;

	};

	photoUpload = $.map(views.data.previewPhotos, function(p, i){
		return {
			member: { name: views.data.current_member.name },
			member_photo: { thumb_link: views.data.current_member.photo },
			photo_link: p,
			uploadTime: (new Date).getTime(),
			link: "http://disneyworld.com/"
		};
	});
	newPhotos = new Items.EventPhotos(getEvent(chosenAlbum),photoUpload);
	views.data.news.unshift( newPhotos );
}

//
// Poll post
//
function post_poll(event){
	views.modal_hide();

	var newPoll = new Items.Poll({
		question: document.getElementById('poll-question').value,
		member: {
			name: views.data.current_member.name,
			photo: views.data.current_member.photo
		}
	});

	var answerEls =	document.querySelectorAll('.choice');
	newPoll.answers = $.map(answerEls, function(a, i){
		return {
			multiple: document.getElementById('multiple').checked,
			answer: a.value,
			voteCount: 0,
			userPicked: false
		};
	});

	views.data.news.unshift( newPoll );
	console.log(views.data.news);
}

// Poll voting
function voteForPoll(event){
	var str          = event.keypath,
			tokens       = str.split('.').slice(0, 2),
			truncKeypath = tokens.join('.'),
			poll         = this.get(truncKeypath);

	for (var i=0; i < poll.answers.length; i++) {

		if(poll.answers[i].userPicked){
			this.add(truncKeypath + '.answers.'+i+'.voteCount');
			this.add(truncKeypath + '.totalVotes');
		}
		// else {
		// 	this.subtract(truncKeypath + '.answers.'+i+'.voteCount');
		// 	this.subtract(truncKeypath + '.totalVotes');
		// }
	}
	this.set(truncKeypath + '.isVoted', true);
	this.set(truncKeypath + '.resultsShown', true);
	return false;
}


function togglePollResults(event){
	var visible = this.get(event.keypath+'.resultsShown');
	this.set(event.keypath+'.resultsShown', !visible);
	return false;
}

/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
DISCUSSION FEED INTERACTIONS
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/

// "Like" a post
function likePost(event) {
	if(this.get(event.keypath+'.userLiked') == true){
		event.context.like_count--;
		this.set(event.keypath+'.userLiked', false);
	}
	else{
		event.context.like_count++;
		this.set(event.keypath+'.userLiked', true);
	}
	return false;
}

function focusCommentBox(event) {
	event.original.preventDefault();

	var textareaEl = $(event.node.offsetParent).find('textarea')[0];
	$(textareaEl).focus();
}


//
// NOT USED YET
// show comment box in post
//
/*
function showCommentBox(event) {
	console.log(this.get(event.keypath+'.showCommentBox'));
	this.set(event.keypath+'.showCommentBox', true);
	return false;
}
*/

// show the post button
function showPostBtn(event) {
	var $postBtn = $(event.node.offsetParent).find('.js-postBtnContainer');

	if (event.node.value.length < 1) {
		$postBtn.addClass('display--none');
	} else {
		$postBtn.removeClass('display--none');
	}
}

// function hidePostBtn(event) {
// 	var $postBtn = $(event.node.offsetParent).find('.js-postBtnContainer');
// 	$postBtn.addClass('display--none');
// }

// post the comment
function postComment(event) {
	var textareaEl    = $(event.node.parentNode).siblings('.chunk').find('textarea')[0],
			$postBtn      = $(event.node.offsetParent).find('.js-postBtnContainer'),
			replyCount    = this.get(event.keypath+'.latest_comment.replyCount'),
			$replyCounter = $(event.node.offsetParent).find('.replyCounter');

	if (replyCount) {
		this.set(event.keypath+'.latest_comment.replyCount', replyCount+1);
	} else {
		this.set(event.keypath+'.latest_comment.replyCount', 1);
	}

	this.push(event.keypath+'.posts', {
		"member": {
			"photo": {"thumb": views.data.current_member.photo },
			"name": views.data.current_member.name
		},
		"created": moment(),
		"updated": moment(),
		"time": moment(),
		"like_count": 0,
		"body": textareaEl.value //probably not the best way to do this...
	});

	// kind of hacky
	$replyCounter.addClass('anim--bounce');
	$postBtn.addClass('display--none');
	textareaEl.value = '';
	// this.set(event.keypath+'.showCommentBox', false);

	return false;
}

// Comment overflow actions
function toggleCommentPopover(event){
	event.original.preventDefault();

	views.momentary_show({
		$target: $(event.node),
		type	 : 'popover',
		buttons: [
			{label: 'Link to post', fn: function(){console.log('Open dialog with copy link input');}},
			{label: 'Report', fn: function(){console.log('Post reported');}},
			{label: 'Mute', fn: function(){console.log('Post muted');}}
		]
	});
}


/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
PHOTO BROWSING
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/
// Toggle edit mode in albums. Only orgs get this
function enter_album_edit_mode(event) {
	$('#albumHeroContent').addClass('display--none');
	$('#photoUploadNewContainer').css('display', 'none'); //adding '.display--none' doesn't work
	$('#photoAlbumGrid .thumb-content').removeClass('display--none');
	$('#photoAlbumGrid .thumb').addClass('thumbScrim');
	$(views._main.$header).removeClass('view-head--transparent view-head--photoOverlay');

	views._main.update_header({
		title: "Album Name",
		subtitle: "n photos",
		cancelMode: {
			label: "Cancel",
			icon: "arrow-left",
			fn: confirm_cancel_album_edits
		},
		buttons: [
			{ label: "Delete", icon: "trash", fn: confirm_delete_album },
			{ label: "Save", fn: exit_album_edit_mode}
		]
	});
}

// Delete photo (from album view)
function delete_photo(event) {
	var $thumbContainer = $(event.node).parents('li');
	$thumbContainer.remove();
}

// Delete photo (from photo detail view)
function delete_photo_fromPopover(event) {
	views.dialog_show({
		headline: "Delete this photo?",
		primaryAction: { label: "Delete photo", fn: function(){ alert('delete photo'); }},
		dismissText: "Cancel"
	});
}

function confirm_delete_album() {
	views.dialog_show({
		headline: "Delete this album?",
		body: "Deleting this album will remove this album and it's photos from your Meetup group",
		primaryAction: { label: "Delete album", fn: delete_album },
		dismissText: "Cancel"
	});
}

function delete_album() {
	views.dialog_hide();
	views.data.photo_albums.splice(0,1); //replace the '0' with the right number
	if(/\/\d+$/ig.test(window.location.href)) { //just checks if url contains a slash and a digit
		views.back();
	}
	views.toast_show({
		message	 : 'Album Name has been deleted',
		button: {label: "Undo", fn: function(){ alert('Reverse the action'); }}
	});
}

// pop up modal confirming to cancel changes
function confirm_cancel_album_edits() {
	views.dialog_show({
		headline: "Discard changes to this album?",
		// body: "This dialog had better be telling me something pretty god damn important since you decided to get all up in the face of the user",
		primaryAction: { label: "Discard changes", fn: exit_album_edit_mode },
		dismissText: "Continue Editing"
	});
}

// cancel any changes made to the album
function exit_album_edit_mode() {
	views.dialog_hide();
	$('#albumHeroContent').removeClass('display--none');
	$('#photoUploadNewContainer').removeAttr('style');
	$('#photoAlbumGrid li:not("#photoUploadNewContainer") .thumb-content').addClass('display--none');
	$('#photoAlbumGrid .thumb').removeClass('thumbScrim');
	$(views._main.$header).addClass('view-head--transparent view-head--photoOverlay');

	views._main.update_header({
		title: "Album Name",
		subtitle: "n photos",
		buttons: [
			{ label: "Edit", fn: enter_album_edit_mode }
		]
	});
}

function activateItem(event) {
	$(event.node.parentNode).find('.item--active').removeClass('item--active');
	$(event.node).addClass('item--active');
}

function paginate_list(evt, pg){
	var limit = $(evt.node.parentElement.previousElementSibling).children('li:not(".display--none")').length + pg;
	$(evt.node).addClass('display--none');
	$('<div class="endlessLoader"></div>').insertAfter($(evt.node));
	setTimeout(function(){ //artificially slowing it down
		$(evt.node.parentElement.previousElementSibling).children('li:lt(' + limit + ')').removeClass('display--none').removeAttr('style');
	}, 1000);
}

function see_all_albums(event) {
	paginate_list(event, 5);
}

function see_all_photos(event) {
	paginate_list(event, 20);
}

function keyboard_photo_nav(){
	window.addEventListener('keyup', function(event){

		switch(event.keyCode) {

			//left arrow
			case 39:
				alert('go to previous photo');
				break;

			//right arrow
			case 37:
				alert('go to next photo');
				break;

			//ESC
			case 27:
				views.media_hide();
				window.location.hash = "";
				break;

			default:
				return false;
		}
	});
}