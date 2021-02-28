import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRespository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";
import { resolve } from 'path'


class SendMailController {

  async execute(request: Request, response: Response){
    const { email, survey_id } = request.body

    const usersRepository = getCustomRepository(UsersRespository)
    const surveysRespository = getCustomRepository(SurveysRepository)
    const surveysUsersRespository = getCustomRepository(SurveysUsersRepository)

    const user = await usersRepository.findOne({email})

    if(!user){
      return response.status(400).json({
        error: "User does not exists!"
      })
    }

    const survey = await surveysRespository.findOne({ id: survey_id})

    if(!survey){
      return response.status(400).json({
        error: "Survey does not exists!"
      })
    }
    const npsPath = resolve(__dirname, "..","views","emails", "npsMail.hbs");

    const variables = {
      name : user.name,
      title: survey.title,
      description: survey.description, 
      user_id: user.id,
      link: process.env.URL_MAIL

    }

    const surveyUserAlreadyExists = await surveysUsersRespository.findOne({
      where: [{user_id: user.id}, {value : null}],
      relations: ["user", "survey"]
    });

    if(surveyUserAlreadyExists){
      await SendMailService.execute(email, survey.title, variables, npsPath )

      return response.json(surveyUserAlreadyExists)
    }

    const surveyUser = surveysUsersRespository.create({
      user_id: user.id,
      survey_id
    })
    await surveysUsersRespository.save(surveyUser)

    await SendMailService.execute(email, survey.title, variables, npsPath)

    return response.json(surveyUser)

  }
}

export { SendMailController }