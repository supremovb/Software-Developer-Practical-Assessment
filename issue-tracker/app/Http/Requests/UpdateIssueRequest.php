<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'priority'    => ['sometimes', 'required', 'in:low,medium,high'],
            'category'    => ['sometimes', 'required', 'string', 'max:100'],
            'status'      => ['sometimes', 'required', 'in:open,in_progress,resolved'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $fields = ['title', 'description', 'category'];
        $trimmed = [];
        foreach ($fields as $field) {
            if (isset($this->$field)) {
                $trimmed[$field] = trim($this->$field);
            }
        }
        if (!empty($trimmed)) {
            $this->merge($trimmed);
        }
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Validation failed.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
