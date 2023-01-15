import { Configuration, OpenAIApi } from "openai";
import {  NextFunction, Response } from 'express';
import { PayloadRequest } from 'payload/dist/express/types';
import { PluginConfig } from '../types';

export async function generateAIMetaTitleClient({ pageContent, locale }: {pageContent: string, locale: string}): Promise<String> {
    const response = await (await fetch('/api/plugin-seo/ai/gpt3/generateAIMetaTitle', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageContent, locale }),
    })).json();

    if(response?.generated) {
        return response.generated;
    }

    return "Error";
} 


export const generateAIMetaTitleServer = async ({handler: {req, res, next}, pluginConfig}: {handler: {req: PayloadRequest, res: Response, next: NextFunction}, pluginConfig: PluginConfig}) => {

    const body: {pageContent: string, locale: string} = req.body;

    const configuration = new Configuration({
        organization: pluginConfig.ai?.gpt3?.apiOrganization,
        apiKey: pluginConfig.ai?.gpt3?.apiKeySecret,
    });
    const openai = new OpenAIApi(configuration);

    let prompt = `These are good meta titles:\n- The best laptops you can buy in 2023 | Tom's Guide\n- How to build your first portfolio - A guide by Semplice\n- Best laptop 2023: 15 laptops for every use case and budget\n###\nContent: ${body.pageContent}\n\nFor this content, write an award-winning, SEO-optimized meta title for an attractive search result on Google in country with locale "${body.locale}". It is less than 50 characters long:`; // Less than 50 characters is a lie, but works best for some reason

    if(pluginConfig.ai?.gpt3?.metaTitle?.prompt) {
        prompt = pluginConfig.ai.gpt3.metaTitle.prompt({pageContent: body.pageContent, locale: body.locale});
    }



    const response = await openai.createCompletion({
        model: pluginConfig.ai?.gpt3?.metaTitle?.model ? pluginConfig.ai.gpt3.metaTitle.model : "text-davinci-003",
        prompt: prompt,

        max_tokens: pluginConfig.ai?.gpt3?.metaTitle?.maxTokens ? pluginConfig.ai.gpt3.metaTitle.maxTokens : 20,
        temperature: pluginConfig.ai?.gpt3?.metaTitle?.temperature ? pluginConfig.ai.gpt3.metaTitle.temperature : 0.4,
        stop:  pluginConfig.ai?.gpt3?.metaTitle?.stop ? pluginConfig.ai.gpt3.metaTitle.stop : ["than 50 characters long:"]
    })

    let generated = response?.data?.choices[0]?.text ? response.data.choices[0].text.trim().replace(/"/g, "") : "Error";

    if(pluginConfig.ai?.metaTitle?.postProcess) {
        generated = pluginConfig.ai.metaTitle.postProcess({
            generatedTitle: generated,
            pageContent: body.pageContent,
            locale: body.locale,
        });
    }
    
    res.status(200).send({ generated: generated });
} 



export async function generateAIMetaDescriptionClient({ pageContent, locale }: {pageContent: string, locale: string}): Promise<String> {
    const response = await (await fetch('/api/plugin-seo/ai/gpt3/generateAIMetaDescription', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageContent, locale }),
    })).json();

    if(response?.generated) {
        return response.generated;
    }

    return "Error";
} 


export const generateAIMetaDescriptionServer = async ({handler: {req, res, next}, pluginConfig}: {handler: {req: PayloadRequest, res: Response, next: NextFunction}, pluginConfig: PluginConfig}) => {

    const body: {pageContent: string, locale: string} = req.body;

    const configuration = new Configuration({
        organization: pluginConfig.ai?.gpt3?.apiOrganization,
        apiKey: pluginConfig.ai?.gpt3?.apiKeySecret,
    });
    const openai = new OpenAIApi(configuration);

    let prompt = `These are good meta descriptions:\n- Making cheesecake is easier than you think! Whip up one of these easy, homemade cheesecake recipes to impress your friends.\n- The official website for planning your Yosemite National Park vacation. Here you can find where to stay, what to see, and what to do.\n- These are the best laptops you can buy in every category, from ultraportable and Chromebooks to gaming laptops.\n- Get everything you need to sew your next garment. Open Monday-Friday 8-5pm, located in the Fashion District.\n###\nContent: ${body.pageContent}\n\nFor this content, write an award-winning, SEO-optimized meta description for an attractive search result on Google in country with locale "${body.locale}". It is less than 50 characters long:`; // Exactly 50 characters is a lie, but works best for some reason

    if(pluginConfig.ai?.gpt3?.metaDescription?.prompt) {
        prompt = pluginConfig.ai.gpt3.metaDescription.prompt({pageContent: body.pageContent, locale: body.locale});
    }


    const response = await openai.createCompletion({
        model: pluginConfig.ai?.gpt3?.metaDescription?.model ? pluginConfig.ai.gpt3.metaDescription.model : "text-davinci-003", // = instruct series
        prompt: prompt,
        max_tokens: pluginConfig.ai?.gpt3?.metaDescription?.maxTokens ? pluginConfig.ai.gpt3.metaDescription.maxTokens : 50,
        temperature: pluginConfig.ai?.gpt3?.metaDescription?.temperature ? pluginConfig.ai.gpt3.metaDescription.temperature : 0.4,
        stop: pluginConfig.ai?.gpt3?.metaDescription?.stop ? pluginConfig.ai.gpt3.metaDescription.stop : ["than 50 characters long:"]
    })

    let generated = response?.data?.choices[0]?.text ? response.data.choices[0].text.trim().replace(/"/g, "") : "Error";

    if(pluginConfig.ai?.metaDescription?.postProcess) {
        generated = pluginConfig.ai.metaDescription.postProcess({
            generatedDescription: generated,
            pageContent: body.pageContent,
            locale: body.locale,
        });
    }

    
    res.status(200).send({ generated: generated });
} 

