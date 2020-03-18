// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getUnreadChannelIds, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {makeGetChannelsByCategory, makeGetCategoriesForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {Channel} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {getItem} from 'selectors/storage';
import {GlobalState} from 'types/store';
import {StoragePrefixes} from 'utils/constants';

export function isCategoryCollapsedFromStorage(state: GlobalState, categoryId: string) {
    return getItem(state, StoragePrefixes.CHANNEL_CATEGORY_COLLAPSED + categoryId, false);
}

export function isCategoryCollapsed(state: GlobalState, categoryId: string) {
    return isUnreadFilterEnabled(state) || isCategoryCollapsedFromStorage(state, categoryId);
}

export function isUnreadFilterEnabled(state: GlobalState) {
    return state.views.channelSidebar.unreadFilterEnabled;
}

function makeGetCollapsedStateForAllCategoriesByTeam(): (state: GlobalState, teamId: string) => Record<string, boolean> {
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (state: GlobalState, teamId: string) => {
        const categories = getCategoriesForTeam(state, teamId);
        return categories.reduce((map: Record<string, boolean>, category: ChannelCategory) => {
            map[category.id] = isCategoryCollapsed(state, category.id);
            return map;
        }, {});
    };
}

export function makeGetCurrentlyDisplayedChannelsForTeam(): (state: GlobalState, teamId: string) => Channel[] {
    const getCategoriesForTeam = makeGetCategoriesForTeam();
    const getChannelsByCategory = makeGetChannelsByCategory();
    const getCollapsedStateForAllCategoriesByTeam = makeGetCollapsedStateForAllCategoriesByTeam();

    return createSelector(
        getCollapsedStateForAllCategoriesByTeam,
        getCategoriesForTeam,
        getChannelsByCategory,
        (state: GlobalState) => getCurrentChannel(state),
        (state: GlobalState) => getUnreadChannelIds(state),
        (collapsedState: Record<string, boolean>, categories: ChannelCategory[], channelsByCategory: RelationOneToOne<ChannelCategory, Channel[]>, currentChannel: Channel, unreadChannelIds: string[]) => {
            return categories.map((category) => {
                const channels = channelsByCategory[category.id];
                const isCollapsed = collapsedState[category.id];

                if (isCollapsed) {
                    const filter = (channel: Channel) => {
                        const filterByUnread = (channelId: string) => channel.id === channelId;
                        const isUnread = unreadChannelIds.some(filterByUnread);
                        if (currentChannel) {
                            return isUnread || currentChannel.id === channel.id;
                        }

                        return isUnread;
                    };
                    return channels.filter(filter);
                }

                return channels;
            }).flat();
        }
    );
}