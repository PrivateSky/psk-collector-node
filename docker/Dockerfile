FROM quay.io/influxdb/influxdb:2.0.0-alpha

RUN DEBIAN_FRONTEND=noninteractive apt-get -y update && apt-get -y upgrade && apt-get -y install apt-utils git wget curl build-essential

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install nodejs

RUN git clone -b integration-docker https://github.com/PrivateSky/psk-collector-node.git
RUN git clone https://github.com/PrivateSky/psk-monitoring-ui.git
RUN echo 'influxd & cd /psk-collector-node && npm install && node ./scripts/initCredentials.js && node ./scripts/createDashboards.js' >> prepareDB.sh
RUN echo 'cd /psk-collector-node && npm start & cd /psk-monitoring-ui/wc-monitor && npm install --unsafe-perm && npm run start-prod' >> start.sh
RUN echo 'bash prepareDB.sh & \n wait $! \n bash start.sh \n' >> startup-script.sh
RUN cat startup-script.sh

EXPOSE 9999
EXPOSE 3333
EXPOSE 5558

CMD bash startup-script.sh
