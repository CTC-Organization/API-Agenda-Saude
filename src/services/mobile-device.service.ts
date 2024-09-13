import { Injectable, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PrismaService } from './prisma.service';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class MobileDeviceService {
    constructor(
        private readonly prisma: PrismaService,
        private patientService: PatientService,
    ) {}
    async mobileDeviceCheckIn({ patientId, expoToken }: { patientId: string; expoToken: string }) {
        try {
            const patient = await this.patientService.getPatientById(patientId);
            if (!!patient && !patient?.mobileDeviceId) {
                return await this.createMobileDevice(patientId, expoToken); // cria o celular no banco
            } else if (!!patient && !!patient?.mobileDeviceId) {
                // com registro
                const foundDevice = await this.prisma.mobileDevice.findFirst({
                    where: {
                        id: patient.mobileDeviceId,
                    },
                });
                if (!!foundDevice) {
                    // se encontrou um dispositivo registrado
                    if (foundDevice.expoToken !== expoToken) {
                        // atualiza o celular no banco
                        return await this.prisma.mobileDevice.update({
                            where: {
                                id: foundDevice.id,
                            },
                            data: {
                                expoToken,
                            },
                        });
                    } else {
                        return foundDevice;
                    }
                } else {
                    // supondo que o usuario está com outro celular no momento - troca o celular no banco
                    // se não achou nenhum dispositivo atualize
                    return await this.createMobileDevice(patientId, expoToken);
                }
            }
        } catch (err) {
            throw err;
        }
    }

    async findPatientsByMobileDevice(expoToken: string) {
        return await this.prisma.mobileDevice.findMany({
            where: {
                expoToken,
            },
            include: {
                patients: true,
            },
        });
    }

    async createMobileDevice(patientId: string, expoToken: string) {
        const newDevice = await this.prisma.mobileDevice.create({
            data: {
                expoToken,
            },
        });
        await this.prisma.patient.update({
            where: { id: patientId },
            data: {
                mobileDeviceId: newDevice.id,
            },
        });
    }

    async sendOneNotification({
        title,
        body,
        sound,
        data,
        mobileDeviceId,
    }: {
        title: string;
        body: string | 'uma notificação';
        sound: string | 'default';
        mobileDeviceId: string;
        data: { withSome: string | 'data' };
    }) {
        const patientExpoToken = await this.prisma.mobileDevice.findFirst({
            where: {
                id: mobileDeviceId,
            },
        });
        const somePushTokens: Array<string> = [patientExpoToken.expoToken];
        // Create a new Expo SDK client
        // optionally providing an access token if you have enabled push security
        let expo = new Expo({
            // accessToken: process.env.EXPO_ACCESS_TOKEN,
            useFcmV1: true,
        });

        // Create the messages that you want to send to clients
        let messages = [];
        for (let pushToken of somePushTokens) {
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                continue;
            }
            // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
            messages.push({
                title,
                to: pushToken,
                sound,
                body,
                data, //data: { withSome: 'data' },
            });
        }
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        (async () => {
            for (let chunk of chunks) {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);
                    tickets.push(...ticketChunk);
                    // NOTE: If a ticket contains an error code in ticket.details.error, you
                    // must handle it appropriately. The error codes are listed in the Expo
                    // documentation:
                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                } catch (error) {
                    console.error(error);
                }
            }
        })();
        // Later, after the Expo push notification service has delivered the
        // notifications to Apple or Google (usually quickly, but allow the service
        // up to 30 minutes when under load), a "receipt" for each notification is
        // created. The receipts will be available for at least a day; stale receipts
        // are deleted.
        //
        // The ID of each receipt is sent back in the response "ticket" for each
        // notification. In summary, sending a notification produces a ticket, which
        // contains a receipt ID you later use to get the receipt.
        //
        // The receipts may contain error codes to which you must respond. In
        // particular, Apple or Google may block apps that continue to send
        // notifications to devices that have blocked notifications or have uninstalled
        // your app. Expo does not control this policy and sends back the feedback from
        // Apple and Google so you can handle it appropriately.
        let receiptIds = [];
        for (let ticket of tickets) {
            // NOTE: Not all tickets have IDs; for example, tickets for notifications
            // that could not be enqueued will have error information and no receipt ID.
            if (ticket.status === 'ok') {
                receiptIds.push(ticket.id);
            }
        }

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        (async () => {
            // Like sending notifications, there are different strategies you could use
            // to retrieve batches of receipts from the Expo service.
            for (let chunk of receiptIdChunks) {
                try {
                    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                    console.log(receipts);

                    // The receipts specify whether Apple or Google successfully received the
                    // notification and information about an error, if one occurred.
                    for (let receiptId in receipts) {
                        let { status, details, __debug } = receipts[receiptId];
                        if (status === 'ok') {
                            continue;
                        } else if (status === 'error') {
                            console.error(`There was an error sending a notification: ${details}`);
                            if (details) {
                                // The error codes are listed in the Expo documentation:
                                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                                // You must handle the errors appropriately.
                                console.error(`The error code is ${__debug}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    }
}
