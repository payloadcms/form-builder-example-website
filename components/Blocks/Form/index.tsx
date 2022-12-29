import React, { useState, useCallback } from 'react';
import { Cell, Grid } from '@faceless-ui/css-grid';
import { fields } from './fields';
import { Form as FormType } from 'payload-plugin-form-builder/dist/types';
import { formatSlug } from '../../../utilities/formatSlug';
import RichText from '../../RichText';
import { BlockContainer } from '../../BlockContainer';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';

import classes from './index.module.scss';

export type Value = unknown

export interface Property {
  [key: string]: Value
}

export interface Data {
  [key: string]: Value | Property | Property[]
}

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: Boolean
  form: FormType
  introContent?: {
    [k: string]: unknown;
  }[];
}

export const FormBlock: React.FC<FormBlockType & {
  id?: string,
}> = (props) => {
  const {
    enableIntro,
    introContent,
    form: formFromProps,
    form: {
      id: formID,
      submitButtonLabel,
      confirmationType,
      redirect,
      confirmationMessage
    } = {},
  } = props;

  const formMethods = useForm();
  const { register, handleSubmit, formState: { errors }, control } = formMethods;

  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>();
  const [error, setError] = useState<{ status?: string, message: string } | undefined>();
  const router = useRouter();

  const onSubmit = useCallback((data: Data) => {
    let loadingTimerID: NodeJS.Timer;

    const submitForm = async () => {
      setError(undefined);

      const dataToSend = Object.entries(data).map(([name, value]) => ({
        field: name,
        value
      }));

      console.log(dataToSend)

      // delay loading indicator by 1s
      loadingTimerID = setTimeout(() => {
        setIsLoading(true);
      }, 1000);

      try {
        const req = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/form-submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            form: formID,
            submissionData: dataToSend,
          })
        })

        const res = await req.json();

        clearTimeout(loadingTimerID);

        if (req.status >= 400) {
          setIsLoading(false);
          setError({
            status: res.status,
            message: res.errors?.[0]?.message || 'Internal Server Error',
          });

          return;
        }

        setIsLoading(false);
        setHasSubmitted(true);

        if (confirmationType === 'redirect' && redirect) {
          const {
            type,
            reference,
            url
          } = redirect;

          let redirectUrl = '';

          if (type === 'custom') redirectUrl = url;

          if (type === 'reference' && reference) {
            redirectUrl = formatSlug(reference);
          };

          if (redirectUrl) router.push(redirectUrl);
        }
      } catch (err) {
        console.warn(err);
        setIsLoading(false);
        setError({
          message: 'Something went wrong.'
        });
      }
    }

    submitForm();
  }, [
    router,
    formID,
    redirect,
    confirmationType,
  ]);

  return (
    <>
      <BlockContainer>
        <Grid className={classes.formWrap}>
          <Cell
            cols={7}
            colsM={4}
            colsS={8}
            className={classes.formCell}
          >
            {enableIntro && introContent && !hasSubmitted && (
              <RichText
                className={classes.intro}
                content={introContent}
              />
            )}
            {!isLoading && hasSubmitted && confirmationType === 'message' && (
              <RichText content={confirmationMessage} />
            )}
            {isLoading && !hasSubmitted && (
              <p>
                Loading, please wait...
              </p>
            )}
            {error && (
              <div>
                {`${error.status || '500'}: ${error.message || ''}`}
              </div>
            )}
            {!hasSubmitted && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className={classes.fieldWrap}>
                  {formFromProps && formFromProps.fields && formFromProps.fields.map((field, index) => {
                    const Field: React.FC<any> = fields?.[field.blockType];
                    if (Field) {
                      return (
                        <Field
                          key={index}
                          form={formFromProps}
                          {...field}
                          {...formMethods}
                          error={errors}
                          register={register}
                          control={control}
                        />
                      )
                    }
                    return null;
                  })}
                </div>
                <button type="submit">{submitButtonLabel}</button>
              </form>
            )}
          </Cell>
        </Grid>
      </BlockContainer>
    </>
  )
}
