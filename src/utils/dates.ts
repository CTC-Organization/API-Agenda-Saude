import { format, isBefore, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/*
dateFiveBusinessDaysAgo receberá a data 5 dias úteis antes da expiração
será compara se 5 dias uteis é antes de hoje caso contrário nao poderá cancelar
*/
export function isBeforeFiveBusinessDays(expiration: Date): {
    dateFiveBusinessDaysAgo: Date;
    isBeforeFiveBusinessDays: boolean;
} {
    const today = new Date();
    let count = 0;
    let dateFiveBusinessDaysAgo = expiration;

    while (count < 5) {
        dateFiveBusinessDaysAgo = subDays(dateFiveBusinessDaysAgo, 1);
        const day = dateFiveBusinessDaysAgo.getDay();
        if (day !== 0 && day !== 6) {
            // 0 = Domingo, 6 = Sábado
            count++;
        }
    }

    const isBeforeFiveBusinessDays = isBefore(today, dateFiveBusinessDaysAgo);

    return {
        dateFiveBusinessDaysAgo,
        isBeforeFiveBusinessDays,
    };
}

export function formatDateToBrazilian(date: Date): string {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}
