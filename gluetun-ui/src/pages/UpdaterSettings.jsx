import ServicePanel from '../components/ServicePanel';

const UpdaterSettings = () => (
  <ServicePanel
    title="Updater"
    endpoint="/v1/updater/status"
    oneShot
    infoTitle="About the updater"
    info="The updater is a one-shot job: it fetches the latest provider server
      list, then reports 'completed' until the next run. The server picker on
      the VPN page uses this data, so a recent run means accurate choices."
    note="A 'completed' status is normal — it means the last run succeeded.
      Periodic runs are configured with the UPDATER_PERIOD environment variable
      on the container; this panel can also trigger a run on demand."
  />
);

export default UpdaterSettings;
