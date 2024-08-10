# Dockerfile para MongoDB
FROM mongo:7.0

# Defina variáveis de ambiente
ARG production2
ARG MONGO_INITDB_DATABASE
ARG MONGO_INITDB_ROOT_USERNAME
ARG MONGO_INITDB_ROOT_PASSWORD

RUN apt-get update -y && apt-get install -y openssl

ENV MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}
ENV MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
ENV MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}

# Gera o keyfile necessário para replicaset
RUN openssl rand -base64 756 > /etc/mongo-keyfile \
    && chmod 400 /etc/mongo-keyfile \
    && chown mongodb:mongodb /etc/mongo-keyfile

# Exponha a porta padrão do MongoDB
EXPOSE 27017

# Comando para iniciar o MongoDB com replicaset
CMD ["mongod", "--replSet", "rs0", "--keyFile", "/etc/mongo-keyfile", "--bind_ip_all", "--port", "27017"]
