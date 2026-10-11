'use client';

import { FormEvent, useState } from 'react';

export default function InquiryForm() {
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <form className="inquiry-form" onSubmit={submit}>
      <div className="inquiry-grid">
        <label>First name<input required name="firstName" autoComplete="given-name" /></label>
        <label>Last name<input required name="lastName" autoComplete="family-name" /></label>
      </div>
      <label>Email address<input required name="email" type="email" autoComplete="email" /></label>
      <label>What are you preparing for?
        <select name="exam" defaultValue=""><option value="" disabled>Select an exam</option><option>GMAT</option><option>GRE</option><option>Executive Assessment</option><option>SAT</option><option>Not sure yet</option></select>
      </label>
      <label>Tell us about your goal<textarea required name="message" rows={5} placeholder="Target score, exam date, or schools on your list" /></label>
      <button type="submit">Request a free consultation <span>→</span></button>
      {sent && <p className="form-confirmation" role="status">Thank you. Your consultation request has been noted.</p>}
    </form>
  );
}
