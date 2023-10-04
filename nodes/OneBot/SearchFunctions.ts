import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { apiRequest } from './GenericFunctions';

export async function getFriendList(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = (await apiRequest.call(this, 'GET', 'get_friend_list')) as {
		data: {
			user_id: number;
			nickname: string;
			remark: string;
		}[];
	};
	return items.data.map((info) => ({
		name: info.nickname,
		value: info.user_id,
		description: info.user_id.toString(),
	}));
}

export async function getGroupList(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = (await apiRequest.call(this, 'GET', 'get_group_list')) as {
		data: { group_id: number; group_name: string }[];
	};
	return items.data.map((info) => ({
		name: info.group_name,
		value: info.group_id,
		description: info.group_id.toString(),
	}));
}

export async function getGroupMemberList(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const query = { group_id: this.getNodeParameter('group_id') };
	const items = (await apiRequest.call(this, 'GET', 'get_group_member_list', undefined, query)) as {
		data: {
			user_id: number;
			nickname: string;
		}[];
	};
	return items.data.map((info) => ({
		name: info.nickname,
		value: info.user_id,
		description: info.user_id.toString(),
	}));
}
