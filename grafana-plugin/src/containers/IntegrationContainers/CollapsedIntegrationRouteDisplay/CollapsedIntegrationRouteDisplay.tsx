import React, { useMemo, useState } from 'react';

import { ConfirmModal, Icon, IconName, Stack } from '@grafana/ui';
import cn from 'classnames/bind';
import { observer } from 'mobx-react';

import { IntegrationBlock } from 'components/Integrations/IntegrationBlock';
import { PluginLink } from 'components/PluginLink/PluginLink';
import { Text } from 'components/Text/Text';
import styles from 'containers/IntegrationContainers/CollapsedIntegrationRouteDisplay/CollapsedIntegrationRouteDisplay.module.scss';
import { RouteButtonsDisplay } from 'containers/IntegrationContainers/ExpandedIntegrationRouteDisplay/ExpandedIntegrationRouteDisplay';
import { RouteHeading } from 'containers/IntegrationContainers/RouteHeading';
import { ChannelFilter } from 'models/channel_filter/channel_filter.types';
import { ApiSchemas } from 'network/oncall-api/api.types';
import { CommonIntegrationHelper } from 'pages/integration/CommonIntegration.helper';
import { IntegrationHelper } from 'pages/integration/Integration.helper';
import { useStore } from 'state/useStore';
import { StackSize } from 'utils/consts';

const cx = cn.bind(styles);

interface CollapsedIntegrationRouteDisplayProps {
  alertReceiveChannelId: ApiSchemas['AlertReceiveChannel']['id'];
  channelFilterId: ChannelFilter['id'];
  routeIndex: number;
  toggle: () => void;
  openEditTemplateModal: (templateName: string | string[], channelFilterId?: ChannelFilter['id']) => void;
  onEditRegexpTemplate: (channelFilterId: ChannelFilter['id']) => void;
  onRouteDelete: (routeId: string) => void;
  onItemMove: () => void;
}

export const CollapsedIntegrationRouteDisplay: React.FC<CollapsedIntegrationRouteDisplayProps> = observer(
  ({
    channelFilterId,
    alertReceiveChannelId,
    routeIndex,
    toggle,
    openEditTemplateModal,
    onEditRegexpTemplate,
    onRouteDelete,
    onItemMove,
  }) => {
    const store = useStore();
    const { escalationChainStore, alertReceiveChannelStore } = store;
    const [routeIdForDeletion, setRouteIdForDeletion] = useState<ChannelFilter['id']>(undefined);

    const channelFilter = alertReceiveChannelStore.channelFilters[channelFilterId];

    const routeWording = useMemo(() => {
      return CommonIntegrationHelper.getRouteConditionWording(
        alertReceiveChannelStore.channelFilterIds[alertReceiveChannelId],
        routeIndex
      );
    }, [routeIndex, alertReceiveChannelStore.channelFilterIds[alertReceiveChannelId]]);

    if (!channelFilter) {
      return null;
    }

    const escalationChain = escalationChainStore.items[channelFilter.escalation_chain];
    const chatOpsAvailableChannels = IntegrationHelper.getChatOpsChannels(channelFilter, store).filter(
      (channel) => channel
    );

    return (
      <>
        <IntegrationBlock
          noContent={false}
          key={channelFilterId}
          toggle={toggle}
          heading={
            <div className={cx('heading-container')}>
              <RouteHeading
                className={cx('heading-container__item', 'heading-container__item--large')}
                routeWording={routeWording}
                routeIndex={routeIndex}
                channelFilter={channelFilter}
                channelFilterIds={alertReceiveChannelStore.channelFilterIds[alertReceiveChannelId]}
              />

              <div className={cx('heading-container__item')}>
                <RouteButtonsDisplay
                  alertReceiveChannelId={alertReceiveChannelId}
                  channelFilterId={channelFilterId}
                  routeIndex={routeIndex}
                  onItemMove={onItemMove}
                  setRouteIdForDeletion={() => setRouteIdForDeletion(channelFilterId)}
                  openRouteTemplateEditor={() => handleEditRoutingTemplate(channelFilter, channelFilterId)}
                />
              </div>
            </div>
          }
          content={
            <div>
              <div className={cx('collapsedRoute__container')}>
                {chatOpsAvailableChannels.length > 0 && (
                  <div className={cx('collapsedRoute__item')}>
                    <Stack gap={StackSize.xs}>
                      <Text type="secondary">Publish to ChatOps</Text>

                      {chatOpsAvailableChannels.map(
                        (chatOpsChannel: { name: string; icon: IconName }, chatOpsIndex) => (
                          <div
                            key={`${chatOpsChannel.name}-${chatOpsIndex}`}
                            className={cx({ 'u-margin-right-xs': chatOpsIndex !== chatOpsAvailableChannels.length })}
                          >
                            <Icon name={chatOpsChannel.icon} className={cx('icon')} />
                            <Text type="primary">{chatOpsChannel.name}</Text>
                          </div>
                        )
                      )}
                    </Stack>
                  </div>
                )}

                <div className={cx('collapsedRoute__item')}>
                  <div className={cx('u-flex', 'u-align-items-center', 'u-flex-gap-xs')}>
                    <Icon name="list-ui-alt" />
                    <Text type="secondary" className={cx('u-margin-right-xs')}>
                      Trigger escalation chain
                    </Text>
                  </div>

                  {escalationChain?.name && (
                    <PluginLink
                      className={cx('hover-button')}
                      target="_blank"
                      query={{ page: 'escalations', id: channelFilter.escalation_chain }}
                    >
                      <Text type="primary">{escalationChain?.name}</Text>
                    </PluginLink>
                  )}

                  {!escalationChain?.name && (
                    <div className={cx('u-flex', 'u-align-items-center', 'u-flex-gap-xs')}>
                      <div className={cx('icon-exclamation')}>
                        <Icon name="exclamation-triangle" />
                      </div>
                      <Text type="primary" data-testid="integration-escalation-chain-not-selected">
                        Not selected
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
        />
        {routeIdForDeletion && (
          <ConfirmModal
            isOpen
            title="Delete route?"
            body="Are you sure you want to delete this route?"
            confirmText="Delete"
            icon="exclamation-triangle"
            onConfirm={onRouteDeleteConfirm}
            onDismiss={() => setRouteIdForDeletion(undefined)}
          />
        )}
      </>
    );

    function handleEditRoutingTemplate(channelFilter, channelFilterId) {
      if (channelFilter.filtering_term_type === 0) {
        onEditRegexpTemplate(channelFilterId);
      } else {
        openEditTemplateModal('route_template', channelFilterId);
      }
    }

    async function onRouteDeleteConfirm() {
      setRouteIdForDeletion(undefined);
      onRouteDelete(routeIdForDeletion);
    }
  }
);
