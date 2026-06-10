import ServicePanel from '../components/ServicePanel';

const UpdaterSettings = () => (
  <ServicePanel
    title="Updater"
    endpoint="/v1/updater/status"
    infoTitle="About the updater"
    info="The updater keeps the VPN provider server lists fresh by periodically
      fetching the latest servers. The server picker on the VPN page uses this
      data, so a recent list means accurate location choices."
    note="The update period is configured through the UPDATER_PERIOD environment
      variable on the container. This panel only triggers or stops the service."
  />
);

export default UpdaterSettings;
