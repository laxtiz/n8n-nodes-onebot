import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { apiRequest } from './GenericFunctions';
import { LoginInfo, MessageAction, OneBotAction } from './Interfaces';
import { getFriendList, getGroupList, getGroupMemberList } from './SearchFunctions';

export class OneBot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OneBot',
		name: 'oneBot',
		icon: 'file:onebot.svg',
		description: 'Consume OneBot API',
		subtitle: '={{ $parameter["operation"] }}',
		version: 1,
		defaults: {
			name: 'OneBot',
		},
		group: ['transform'],
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'oneBotApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'message',
				options: [
					{
						name: 'Bot',
						value: 'bot',
					},
					{
						name: 'Friend',
						value: 'friend',
					},
					{
						name: 'Group',
						value: 'group',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Misc',
						value: 'misc',
					},
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'get_login_info',
				noDataExpression: true,
				options: [
					{
						name: 'Get Login Info',
						value: 'get_login_info',
						action: 'Get login info',
					},
				],
				displayOptions: {
					show: {
						resource: ['bot'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'get_friend_list',
				noDataExpression: true,
				options: [
					{
						name: 'Get Friend List',
						value: 'get_friend_list',
						action: 'Get friend list',
					},
					{
						name: 'Get Stranger Info',
						value: 'get_stranger_info',
						action: 'Get stranger info',
					},
				],
				displayOptions: {
					show: {
						resource: ['friend'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'get_group_list',
				noDataExpression: true,
				options: [
					{
						name: 'Get Group Info',
						value: 'get_group_info',
						action: 'Get group info',
					},
					{
						name: 'Get Group List',
						value: 'get_group_list',
						action: 'Get group list',
					},
					{
						name: 'Get Group Member Info',
						value: 'get_group_member_info',
						action: 'Get group member info',
					},
					{
						name: 'Get Group Member List',
						value: 'get_group_member_list',
						action: 'Get group member list',
					},
				],
				displayOptions: {
					show: {
						resource: ['group'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'send_private_msg',
				noDataExpression: true,
				options: [
					{
						name: 'Send Private Message',
						value: 'send_private_msg',
						action: 'Send private message',
					},
					{
						name: 'Send Group Message',
						value: 'send_group_msg',
						action: 'Send group message',
					},
				],
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'get_status',
				options: [
					{
						name: 'Get Status',
						value: 'get_status',
						action: 'Get status',
					},
					{
						name: 'Get Version Info',
						value: 'get_version_info',
						action: 'Get version info',
					},
				],
				displayOptions: {
					show: {
						resource: ['misc'],
					},
				},
			},
			{
				displayName: 'User Name or ID',
				name: 'user_id',
				type: 'options',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getFriendList',
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['send_private_msg', 'get_stranger_info'],
					},
				},
			},
			{
				displayName: 'Group Name or ID',
				name: 'group_id',
				type: 'options',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getGroupList',
				},
				default: '',
				displayOptions: {
					show: {
						operation: [
							'send_group_msg',
							'get_group_info',
							'get_group_member_list',
							'get_group_member_info',
						],
					},
				},
			},
			{
				displayName: 'Member Name or ID',
				name: 'user_id',
				type: 'options',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getGroupMemberList',
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['get_group_member_info'],
					},
				},
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send_private_msg', 'send_group_msg'],
					},
				},
			},
			{
				displayName: 'Forward Mode',
				name: 'forward_mode',
				type: 'boolean',
				noDataExpression: true,
				default: false,
				description: 'Whether to forward messages when there are multiple items',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send_private_msg', 'send_group_msg'],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			getFriendList,
			getGroupList,
			getGroupMemberList,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource');

		if (resource === 'message' && items.length > 1) {
			const forward_mode = this.getNodeParameter('forward_mode', 0) as boolean;
			if (forward_mode) {
				const operation = this.getNodeParameter('operation', 0) as string;
				const action = { resource, operation } as MessageAction;

				const {data: info} = (await apiRequest.call(this, 'GET', '/get_login_info')) as {
					data: LoginInfo
				};

				const body: IDataObject = {};
				body.messages = items.map((item, index) => ({
					type: 'node',
					data: {
						name: info.nickname,
						uin: info.user_id.toString(),
						content: this.getNodeParameter('message', index) as string,
					},
				}));

				let endpoint = '';
				switch (action.operation) {
					case 'send_private_msg':
						endpoint = '/send_private_forward_msg';
						body.user_id = this.getNodeParameter('user_id', 0) as number;
						break;

					case 'send_group_msg':
						endpoint = '/send_group_forward_msg';
						body.group_id = this.getNodeParameter('group_id', 0) as number;
						break;
				}
				const data = await apiRequest.call(this, 'POST', endpoint, body);
				const json = this.helpers.returnJsonArray(data);
				return [json];
			}
		}

		const result: INodeExecutionData[] = [];
		for (let index = 0; index < items.length; index++) {
			const operation = this.getNodeParameter('operation', index);
			const action = { resource, operation } as OneBotAction;

			let body: IDataObject = {};
			switch (action.operation) {
				case 'send_private_msg':
					body.message = this.getNodeParameter('message', index) as string;
				case 'get_stranger_info':
					body.user_id = this.getNodeParameter('user_id', index) as number;
					break;

				case 'send_group_msg':
					body.message = this.getNodeParameter('message', index) as string;
				case 'get_group_member_list':
				case 'get_group_info':
					body.group_id = this.getNodeParameter('group_id', index) as number;
					break;

				case 'get_group_member_info':
					body.group_id = this.getNodeParameter('group_id', index) as number;
					body.user_id = this.getNodeParameter('user_id', index) as number;
					break;
			}

			const method: IHttpRequestMethods = Object.keys(body).length == 0 ? 'GET' : 'POST';
			const data = await apiRequest.call(this, method, action.operation, body);
			const json = this.helpers.returnJsonArray(data);
			const executionData = this.helpers.constructExecutionMetaData(json, {
				itemData: { item: index },
			});

			result.push(...executionData);
		}
		return [result];
	}
}
