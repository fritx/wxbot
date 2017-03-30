FROM ubuntu:latest

MAINTAINER huangruichang "532079207@qq.com"

RUN apt-get upgrade && apt-get update -y

EXPOSE 8233

# basic tools
RUN apt-get install git curl -y

# running electron on linux headless
# https://github.com/segmentio/nightmare/issues/224#issuecomment-141575361
RUN apt-get install -y libgtk2.0-0 libgconf-2-4 \
    libasound2 libxtst6 libxss1 libnss3 xvfb

# nodejs related
# https://nodejs.org/en/download/package-manager/
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash
RUN apt-get install -y nodejs

# WXBOT HOME
ENV WXBOT_HOME /home/wxbot

# clone wxbot
RUN git clone https://github.com/fritx/wxbot.git $WXBOT_HOME

# replace npm and electron download source
RUN echo -e "registry=https://registry.npm.taobao.org\nelectron_mirror=https://npm.taobao.org/mirrors/electron/" > ~/.npmrc

RUN cd $WXBOT_HOME && npm install

# install http-server
RUN npm install http-server -g

# Start wxbot
CMD xvfb-run --server-args="-screen 0 1024x768x24" node $WXBOT_HOME & http-server /tmp -p 8233 -s
