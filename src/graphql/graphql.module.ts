import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import * as _ from 'lodash';
import { Module } from '@nestjs/common';
import * as Joi from 'joi';

const generateEndPoint = (rootPath: string, postPath?: string) => {
  return `${rootPath}${postPath}`;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : `.env`,
      ],
      validationSchema: Joi.object({
        GRAPHQL_API_PORT: Joi.number().integer().required(),
        GRAPHQL_API_ROOT_PATH: Joi.string().required(),
        GRAPHQL_END_POINT: Joi.string().required(),
        SUBSCRIPTION_END_POINT: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => {
        const config = {
          autoSchemaFile: __dirname + '/schema.gql',
          path: generateEndPoint(
            configService.get(`GRAPHQL_API_ROOT_PATH`),
            configService.get(`GRAPHQL_END_POINT`),
          ),
          sortSchema: false,
          playground: {
            endpoint: generateEndPoint(
              configService.get(`GRAPHQL_API_ROOT_PATH`),
              configService.get(`GRAPHQL_END_POINT`),
            ),
            subscriptionEndpoint: generateEndPoint(
              configService.get(`GRAPHQL_API_ROOT_PATH`),
              configService.get(`SUBSCRIPTION_END_POINT`),
            ),
          },
          installSubscriptionHandlers: true,
          subscriptions: {
            'graphql-ws': {
              //deprecated
              path: generateEndPoint(
                configService.get(`GRAPHQL_API_ROOT_PATH`),
                configService.get(`SUBSCRIPTION_END_POINT`),
              ),
              context: (req, connectionParams, extra) => {
                if (
                  req['connectionParams'] &&
                  req['connectionParams']['authorization']
                ) {
                  if (!req.headers) {
                    req['headers'] = {};
                  }
                  req.headers['authorization'] =
                    req['connectionParams']['authorization'];
                }
                return { req, connectionParams, extra };
              },
            },
            'subscriptions-transport-ws': {
              path: generateEndPoint(
                configService.get(`GRAPHQL_API_ROOT_PATH`),
                configService.get(`SUBSCRIPTION_END_POINT`),
              ),
              onConnect: (headersRaw: Record<string, unknown>) => {
                const headers = Object.keys(headersRaw).reduce((dest, key) => {
                  dest[key.toLowerCase()] = headersRaw[key];
                  return dest;
                }, {});
                return {
                  req: {
                    headers: headers,
                  },
                };
              },
            },
            onConnect: (headersRaw: Record<string, unknown>) => {
              const headers = Object.keys(headersRaw).reduce((dest, key) => {
                dest[key.toLowerCase()] = headersRaw[key];
                return dest;
              }, {});
              return {
                req: {
                  headers: headers,
                },
              };
            },
          },
        };
        return config;
      },
    }),
  ],
})
export class GraphqlModule {}
