import React, { useState, useEffect } from "react";


export const LoginForm = () => {

    return (
        <div className="flex justify-center items-center min-h-screen">
            <form className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 space-y-4">
                <fieldset className="fieldset">
                    <label className="label">Username</label>
                    <input
                        type="text"
                        className="input validator"
                        placeholder="Username"
                        required
                        pattern="[A-Za-z][A-Za-z0-9\-]*"
                        minLength={3} maxLength={30}
                        title="Only letters, numbers or dash"
                    />
                </fieldset>

                <label className="fieldset">
                    <span className="label">Password</span>
                    <input
                        type="password"
                        className="input validator"
                        placeholder="Password"
                        required
                        minLength={8}
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                    />
                </label>

                <button className="btn btn-neutral mt-4" type="submit">Login</button>
            </form>
        </div>
    )
}