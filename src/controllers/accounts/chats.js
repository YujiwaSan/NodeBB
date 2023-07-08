'use strict';

const db = require('../../database');
const messaging = require('../../messaging');
const meta = require('../../meta');
const user = require('../../user');
const privileges = require('../../privileges');
const helpers = require('../helpers');

const chatsController = module.exports;

chatsController.get = async function (req, res, next) {
	if (meta.config.disableChat) {
		return next();
	}

	const uid = await user.getUidByUserslug(req.params.userslug);
	if (!uid) {
		return next();
	}
	const canChat = await privileges.global.can('chat', req.uid);
	if (!canChat) {
		return next(new Error('[[error:no-privileges]]'));
	}
	const [recentChats, publicRooms, privateRoomCount] = await Promise.all([
		messaging.getRecentChats(req.uid, uid, 0, 29),
		messaging.getPublicRooms(req.uid, uid),
		db.sortedSetCard(`uid:${uid}:chat:rooms`),
	]);
	if (!recentChats) {
		return next();
	}

	if (!req.params.roomid) {
		return res.render('chats', {
			rooms: recentChats.rooms,
			publicRooms: publicRooms,
			privateRoomCount: privateRoomCount,
			uid: uid,
			userslug: req.params.userslug,
			nextStart: recentChats.nextStart,
			allowed: true,
			title: '[[pages:chats]]',
		});
	}
	const room = await messaging.loadRoom(req.uid, { uid: uid, roomId: req.params.roomid });
	if (!room) {
		return next();
	}

	room.rooms = recentChats.rooms;
	room.nextStart = recentChats.nextStart;
	room.publicRooms = publicRooms;
	room.privateRoomCount = privateRoomCount;
	room.title = room.roomName || room.usernames || '[[pages:chats]]';
	room.uid = uid;
	room.userslug = req.params.userslug;
	room.bodyClasses = ['chat-loaded'];
	room.canViewInfo = await privileges.global.can('view:users:info', uid);

	res.render('chats', room);
};

chatsController.redirectToChat = async function (req, res, next) {
	if (!req.loggedIn) {
		return next();
	}
	const userslug = await user.getUserField(req.uid, 'userslug');
	if (!userslug) {
		return next();
	}
	const roomid = parseInt(req.params.roomid, 10);
	helpers.redirect(res, `/user/${userslug}/chats${roomid ? `/${roomid}` : ''}`);
};
