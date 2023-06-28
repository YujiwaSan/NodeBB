'use strict';

const db = require('../database');
const user = require('../user');

const helpers = require('./helpers');

const local = module.exports;

local.follow = async (actorId, objectId) => {
	// Sanity checks
	const actorExists = await helpers.query(actorId);
	if (!actorId || !actorExists) {
		throw new Error('[[error:invalid-uid]]'); // should probably be AP specific
	}

	if (!objectId) {
		throw new Error('[[error:invalid-uid]]'); // should probably be AP specific
	}
	const localUid = await helpers.resolveLocalUid(objectId);

	console.log(actorId, localUid);

	// The below logic matches toggleFollow() in src/user/follow.js
	// const isFollowing = await user.isFollowing(actorId, localUid);
	// if (isFollowing) {
	// 	throw new Error('[[error:already-following]]');
	// }
	// const now = Date.now();
	// await Promise.all([
	// 	db.sortedSetAddBulk([
	// 		[`following:${actorId}`, now, localUid],
	// 		[`followers:${localUid}`, now, actorId],
	// 	]),
	// ]);

	// const [followingCount, followerCount] = await Promise.all([
	// 	db.sortedSetCard(`following:${actorId}`),
	// 	db.sortedSetCard(`followers:${localUid}`),
	// ]);
	// await Promise.all([
	// 	user.setUserField(actorId, 'followingCount', followingCount),
	// 	user.setUserField(localUid, 'followerCount', followerCount),
	// ]);
};
