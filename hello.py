#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import sys
from datetime import datetime


def load_language_messages():
    """言語別挨拶メッセージを定義"""
    return {
        'en': {
            'standard': 'Hello, {name}!',
            'formal': 'Good day, {name}.',
            'casual': 'Hey, {name}!'
        },
        'ja': {
            'standard': 'こんにちは、{name}！',
            'formal': 'お世話になっております、{name}様。',
            'casual': '{name}ちゃん、どうも！'
        },
        'fr': {
            'standard': 'Bonjour, {name}!',
            'formal': 'Bonsoir, {name}.',
            'casual': 'Salut, {name}!'
        },
        'de': {
            'standard': 'Hallo, {name}!',
            'formal': 'Guten Tag, {name}.',
            'casual': 'Tach, {name}!'
        },
        'es': {
            'standard': '¡Hola, {name}!',
            'formal': 'Buenos días, {name}.',
            'casual': '¡Ey, {name}!'
        }
    }


def validate_language(language):
    """指定された言語がサポートされているか検証"""
    supported_languages = ['en', 'ja', 'fr', 'de', 'es']
    return language.lower() in supported_languages


def get_message(language='en', name='World', format_type='standard', timestamp=False):
    """指定された条件でメッセージを生成"""
    try:
        messages = load_language_messages()
        
        if not validate_language(language):
            language = 'en'  # デフォルト言語
        
        # 言語とフォーマットが存在しない場合はデフォルト値を使用
        language_messages = messages.get(language, messages['en'])
        message_format = language_messages.get(format_type, language_messages['standard'])
        
        # nameパラメータに問題がないか確認
        if not isinstance(name, str):
            name = str(name)
        
        greeting = message_format.format(name=name)
        
        if timestamp:
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            greeting = f"[{current_time}] {greeting}"
        
        return greeting
    except KeyError as e:
        print(f"エラー: 無効なパラメータが指定されました - {e}", file=sys.stderr)
        return f"Hello, {name}!"  # フォールバックメッセージ
    except Exception as e:
        print(f"メッセージ生成中にエラーが発生しました: {e}", file=sys.stderr)
        return f"Hello, {name}!"  # フォールバックメッセージ


def parse_arguments():
    """コマンドライン引数を解析"""
    try:
        parser = argparse.ArgumentParser(
            description='Print a greeting message with various options.'
        )
        parser.add_argument('--name', '-n', type=str, default='World',
                            help='Name to greet (default: World)')
        parser.add_argument('--language', '-l', type=str, default='en',
                            choices=['en', 'ja', 'fr', 'de', 'es'],
                            help='Language for greeting (default: en)')
        parser.add_argument('--timestamp', '-t', action='store_true',
                            help='Add timestamp to the greeting')
        parser.add_argument('--format', '-f', type=str, default='standard',
                            choices=['standard', 'formal', 'casual'],
                            help='Format of greeting (default: standard)')
        parser.add_argument('--version', action='version', version='%(prog)s 1.0.0',
                            help='Show program version')
        
        return parser.parse_args()
    except SystemExit:
        # argparseが引数エラーで終了するのを防ぐ（必要に応じて）
        raise
    except Exception as e:
        print(f"引数解析中にエラーが発生しました: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    try:
        args = parse_arguments()
        greeting = get_message(
            language=args.language,
            name=args.name,
            format_type=args.format,
            timestamp=args.timestamp
        )
        print(greeting)
    except KeyboardInterrupt:
        print("\nプログラムが中断されました。", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"プログラム実行中にエラーが発生しました: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()