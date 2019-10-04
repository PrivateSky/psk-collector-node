FROM quay.io/influxdb/influxdb:2.0.0-alpha

RUN DEBIAN_FRONTEND=noninteractive apt-get -y update && apt-get -y upgrade && apt-get -y install apt-utils git wget curl build-essential

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install nodejs

RUN git clone https://github.com/PrivateSky/psk-collector-node.git
RUN git clone https://github.com/PrivateSky/psk-monitoring-ui.git
RUN echo 'influxd & cd /psk-collector-node && npm install && npm start & cd /psk-monitoring-ui/wc-monitor && npm install --unsafe-perm && npm run start-prod' >> startup-script.sh

EXPOSE 9999
EXPOSE 3333

CMD bash startup-script.sh