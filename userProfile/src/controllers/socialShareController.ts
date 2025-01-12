import { Request, Response } from "express";
import db from '../../db';
import { z } from "zod";

// Validation schema for share requests
const shareRequestSchema = z.object({
    shareType: z.enum(['CO2_MILESTONE']),
    platform: z.enum(['TWITTER', 'FACEBOOK', 'LINKEDIN']),
    customMessage: z.string().optional(),
});

export async function createSocialShare(req: Request, res: Response) {
    try {
        const validation = shareRequestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Invalid share request' });
        }

        const { shareType, platform, customMessage } = validation.data;
        const userId = req.user_id;

        // Generate share content based on type
        const content = await generateShareContent(userId, shareType, customMessage);
        
        // Return sharing URL and content
        res.status(201).json({
            shareUrl: generateShareUrl(platform, content.message),
            content: content.message
        });

    } catch (error) {
        console.error('Share creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function generateShareContent(userId: string, shareType: string, customMessage?: string) {
    let message = '';
    let metrics = {};

    switch (shareType) {
        case 'CO2_MILESTONE':
            const co2Data = await getCO2Metrics(userId);
            message = `🌱 I've prevented ${co2Data.total}kg of CO2 emissions with sustainable food choices! Join me on SinCarne`;
            metrics = co2Data;
            break;

    }

    if (customMessage) {
        message = `${customMessage}\n\n${message}`;
    }

    return {
        message,
        metrics
    };
}

export function generateShareUrl(platform: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    const appUrl = process.env.APP_URL || 'https://sincarne.app';
    
    switch (platform) {
        case 'TWITTER':
            return `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${appUrl}`;
        case 'FACEBOOK':
            return `https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}&u=${appUrl}`;
        case 'LINKEDIN':
            return `https://www.linkedin.com/sharing/share-offsite/?url=${appUrl}&summary=${encodedMessage}`;
        default:
            return '';
    }
}

// Helper functions using existing database structure
export async function getCO2Metrics(userId: string): Promise<{ total: number }> {
    return new Promise((resolve, reject) => {
        const userIdNum = parseInt(userId);
        
        db.get('SELECT CO2Prevented FROM Users WHERE id = ?', [userIdNum], (err, row: any) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                total: row?.CO2Prevented || 0
            });
        });
    });
}



